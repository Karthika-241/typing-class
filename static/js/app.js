/**
 * Core Application Controller - Typing Class
 * Manages game state, routing, audio synthesis, virtual keyboard rendering, and API communications.
 */
class AppController {
    constructor() {
        this.currentUser = null;
        this.soundEnabled = true;
        this.audioCtx = null;
        
        // Instantiate child game engines
        this.beginnerGame = new BeginnerGame();
        this.intermediateGame = new IntermediateGame();
        this.examGame = new ExamGame();
        
        // Active score results caching
        this.currentExamResult = null;

        // Key-to-finger mapping for keyboard highlights and guide colors
        this.keyboardRows = [
            [
                { label: '`', val: '`', finger: 'pinky-l' },
                { label: '1', val: '1', finger: 'pinky-l' },
                { label: '2', val: '2', finger: 'ring-l' },
                { label: '3', val: '3', finger: 'middle-l' },
                { label: '4', val: '4', finger: 'index-l' },
                { label: '5', val: '5', finger: 'index-l' },
                { label: '6', val: '6', finger: 'index-r' },
                { label: '7', val: '7', finger: 'index-r' },
                { label: '8', val: '8', finger: 'middle-r' },
                { label: '9', val: '9', finger: 'ring-r' },
                { label: '0', val: '0', finger: 'pinky-r' },
                { label: '-', val: '-', finger: 'pinky-r' },
                { label: '=', val: '=', finger: 'pinky-r' },
                { label: 'Backspace', val: 'backspace', finger: 'pinky-r', type: 'key-backspace' }
            ],
            [
                { label: 'Tab', val: 'tab', finger: 'pinky-l', type: 'key-tab' },
                { label: 'Q', val: 'q', finger: 'pinky-l' },
                { label: 'W', val: 'w', finger: 'ring-l' },
                { label: 'E', val: 'e', finger: 'middle-l' },
                { label: 'R', val: 'r', finger: 'index-l' },
                { label: 'T', val: 't', finger: 'index-l' },
                { label: 'Y', val: 'y', finger: 'index-r' },
                { label: 'U', val: 'u', finger: 'index-r' },
                { label: 'I', val: 'i', finger: 'middle-r' },
                { label: 'O', val: 'o', finger: 'ring-r' },
                { label: 'P', val: 'p', finger: 'pinky-r' },
                { label: '[', val: '[', finger: 'pinky-r' },
                { label: ']', val: ']', finger: 'pinky-r' },
                { label: '\\', val: '\\', finger: 'pinky-r' }
            ],
            [
                { label: 'Caps', val: 'capslock', finger: 'pinky-l', type: 'key-caps' },
                { label: 'A', val: 'a', finger: 'pinky-l' },
                { label: 'S', val: 's', finger: 'ring-l' },
                { label: 'D', val: 'd', finger: 'middle-l' },
                { label: 'F', val: 'f', finger: 'index-l' },
                { label: 'G', val: 'g', finger: 'index-l' },
                { label: 'H', val: 'h', finger: 'index-r' },
                { label: 'J', val: 'j', finger: 'index-r' },
                { label: 'K', val: 'k', finger: 'middle-r' },
                { label: 'L', val: 'l', finger: 'ring-r' },
                { label: ';', val: ';', finger: 'pinky-r' },
                { label: "'", val: "'", finger: 'pinky-r' },
                { label: 'Enter', val: 'enter', finger: 'pinky-r', type: 'key-enter' }
            ],
            [
                { label: 'Shift', val: 'shift', finger: 'pinky-l', type: 'key-shift' },
                { label: 'Z', val: 'z', finger: 'pinky-l' },
                { label: 'X', val: 'x', finger: 'ring-l' },
                { label: 'C', val: 'c', finger: 'middle-l' },
                { label: 'V', val: 'v', finger: 'index-l' },
                { label: 'B', val: 'b', finger: 'index-l' },
                { label: 'N', val: 'n', finger: 'index-r' },
                { label: 'M', val: 'm', finger: 'index-r' },
                { label: ',', val: ',', finger: 'middle-r' },
                { label: '.', val: '.', finger: 'ring-r' },
                { label: '/', val: '/', finger: 'pinky-r' },
                { label: 'Shift', val: 'shift', finger: 'pinky-r', type: 'key-shift' }
            ],
            [
                { label: 'Space', val: ' ', finger: 'thumb', type: 'key-space' }
            ]
        ];

        this.initEvents();
    }

    initEvents() {
        // Form submissions (profile registration)
        const form = document.getElementById('welcome-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('child-name').value.trim();
                const age = document.getElementById('child-age').value;
                this.registerUser(name, age);
            });
        }

        // Sound music toggler
        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.soundEnabled = !this.soundEnabled;
                if (this.soundEnabled) {
                    soundBtn.className = "control-btn sound-on";
                    soundBtn.innerHTML = '<span class="icon">🔊</span> Sound ON';
                } else {
                    soundBtn.className = "control-btn sound-off";
                    soundBtn.innerHTML = '<span class="icon">🔇</span> Sound OFF';
                }
            });
        }

        // Leaderboard toggle buttons
        document.getElementById('leaderboard-btn').addEventListener('click', () => {
            this.showLeaderboard();
        });
        document.getElementById('leaderboard-close-btn').addEventListener('click', () => {
            if (this.currentUser) {
                this.showLevelSelect();
            } else {
                this.showScreen('screen-welcome');
            }
        });

        // Logout profiles
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.currentUser = null;
            document.getElementById('welcome-form').reset();
            this.showScreen('screen-welcome');
        });

        // Close certificate modals
        document.getElementById('cert-close-btn').addEventListener('click', () => {
            document.getElementById('certificate-modal').classList.remove('active');
        });
        
        // Show certificate trigger
        document.getElementById('btn-show-certificate').addEventListener('click', () => {
            this.renderCertificate();
        });
    }

    // ================= SCREEN ROUTING =================
    showScreen(screenId) {
        // Deactivate all running child game loops before swapping screens
        this.beginnerGame.stop();
        this.intermediateGame.stop();
        this.examGame.stop();

        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.add('active');
        }
    }

    // ================= DYNAMIC KEYBOARD RENDERER =================
    renderVirtualKeyboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        this.keyboardRows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyDiv = document.createElement('div');
                keyDiv.className = `key ${key.type || ''}`;
                keyDiv.textContent = key.label;
                keyDiv.setAttribute('data-key', key.val);
                keyDiv.setAttribute('data-finger', key.finger);
                rowDiv.appendChild(keyDiv);
            });
            
            container.appendChild(rowDiv);
        });
    }

    // ================= AUDIO SYNTHESIZERS (WEB AUDIO API) =================
    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    playClickSound() {
        if (!this.soundEnabled) return;
        this.initAudio();

        // Simulate wooden keyboard tap (short high-frequency decay sound)
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioCtx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.06);
    }

    playCorrectSound() {
        if (!this.soundEnabled) return;
        this.initAudio();

        // Cheerful double chime (C5 -> E5)
        const now = this.audioCtx.currentTime;
        const playNote = (freq, startOffset, duration) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + startOffset);
            
            gain.gain.setValueAtTime(0, now + startOffset);
            gain.gain.linearRampToValueAtTime(0.2, now + startOffset + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + startOffset + duration);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start(now + startOffset);
            osc.stop(now + startOffset + duration);
        };

        playNote(523.25, 0, 0.15); // C5 note
        playNote(659.25, 0.08, 0.25); // E5 note
    }

    playWrongSound() {
        if (!this.soundEnabled) return;
        this.initAudio();

        // Low buzz warning tone
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130.81, this.audioCtx.currentTime); // C3 low freq

        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.26);
    }

    playBalloonPop() {
        if (!this.soundEnabled) return;
        this.initAudio();

        const now = this.audioCtx.currentTime;
        const bufferSize = this.audioCtx.sampleRate * 0.15; // 0.15s duration
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate custom white noise for pop texture
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.audioCtx.createBufferSource();
        noiseNode.buffer = buffer;

        // Bandpass filter to sculpt the sound
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.15);
        filter.Q.value = 6.0;

        const gain = this.audioCtx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        noiseNode.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        noiseNode.start(now);
        noiseNode.stop(now + 0.16);
    }

    playFanfare() {
        if (!this.soundEnabled) return;
        this.initAudio();

        const now = this.audioCtx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4 -> E4 -> G4 -> C5
        
        notes.forEach((freq, idx) => {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.1);
            
            gain.gain.setValueAtTime(0, now + idx * 0.1);
            gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.5);
            
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            
            osc.start(now + idx * 0.1);
            osc.stop(now + idx * 0.1 + 0.55);
        });
    }

    // ================= API BACKEND NETWORKING =================
    registerUser(name, age) {
        const payload = { name: name, age: parseInt(age) };
        
        fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                this.currentUser = data.user;
                document.getElementById('display-name').textContent = this.currentUser.name;
                
                // Fetch saved levels achievements
                this.loadUserProgress();
                this.showLevelSelect();
            } else {
                alert("Cannot sign in: " + data.message);
            }
        })
        .catch(err => {
            console.error("Sign up request failed", err);
            // Standalone Fallback for student demo
            this.currentUser = { id: 999, name: name, age: age };
            document.getElementById('display-name').textContent = name;
            this.showLevelSelect();
        });
    }

    loadUserProgress() {
        if (!this.currentUser) return;

        // Fetch beginner/intermediate progress
        fetch(`/api/progress/${this.currentUser.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Initialize cards text
                document.getElementById('fill-beginner').style.width = '0%';
                document.getElementById('text-beginner').textContent = '0% Complete';
                document.getElementById('fill-intermediate').style.width = '0%';
                document.getElementById('text-intermediate').textContent = '0% Complete';

                data.progress.forEach(p => {
                    if (p.level === 'beginner') {
                        this.latestBeginnerLesson = p.lesson;
                        // Estimate beginner completion percentage based on lesson name index
                        const drillMap = { 
                            "Lesson 1: Meet the Home Row": 15, 
                            "Lesson 2: Left Hand": 30, 
                            "Lesson 3: Right Hand": 45, 
                            "Lesson 4: Both Hands": 60, 
                            "Lesson 5: Home Row Patterns": 80, 
                            "Lesson 6: Simple Words": 100,
                            // Fallbacks
                            "Home Row (F J)": 20, 
                            "Left Hand Home Row (A S D F)": 40, 
                            "Right Hand Home Row (J K L ;)": 60, 
                            "Full Home Row": 80, 
                            "Top Row Keys": 90, 
                            "Bottom Row Keys": 100 
                        };
                        const pct = drillMap[p.lesson] || 15;
                        document.getElementById('fill-beginner').style.width = `${pct}%`;
                        document.getElementById('text-beginner').textContent = `${pct}% Complete (${p.lesson})`;
                    }
                    else if (p.level === 'intermediate') {
                        const pct = Math.min(100, Math.round(p.words_completed / 30 * 100));
                        document.getElementById('fill-intermediate').style.width = `${pct}%`;
                        document.getElementById('text-intermediate').textContent = `${pct}% Complete (Score: ${p.wpm} WPM)`;
                    }
                });
            }
        });

        // Fetch Exam achievements
        fetch(`/api/exam-results/${this.currentUser.id}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.results.length > 0) {
                // Find highest WPM result
                const bestWpm = Math.max(...data.results.map(r => r.wpm));
                document.getElementById('best-exam-wpm').textContent = `Best WPM: ${bestWpm}`;
            } else {
                document.getElementById('best-exam-wpm').textContent = 'Best WPM: --';
            }
        });
    }

    saveProgressApi(payload) {
        fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                console.log("Progress saved on backend.");
                // Reload dashboard completions
                this.loadUserProgress();
            }
        })
        .catch(err => console.error("Error saving progress API", err));
    }

    showLeaderboard() {
        this.showScreen('screen-leaderboard');
        
        const body = document.getElementById('leaderboard-body');
        body.innerHTML = '<tr><td colspan="6">Loading ranks... 🏆</td></tr>';

        fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                body.innerHTML = '';
                
                if (data.leaderboard.length === 0) {
                    body.innerHTML = '<tr><td colspan="6">No score records yet! Be the first cadet! 🚀</td></tr>';
                    return;
                }

                data.leaderboard.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>#${row.rank}</strong></td>
                        <td>${row.name}</td>
                        <td>${row.age} yrs</td>
                        <td>${row.wpm} WPM</td>
                        <td>${row.accuracy}%</td>
                        <td><span class="highlight">${row.score}/100</span></td>
                    `;
                    body.appendChild(tr);
                });
            }
        })
        .catch(err => {
            console.error("Leaderboard fetch failed", err);
            body.innerHTML = '<tr><td colspan="6" class="danger">Offline. Run Flask server to view live database ranks.</td></tr>';
        });
    }

    // ================= MODAL CERTIFICATE =================
    renderCertificate() {
        if (!this.currentUser || !this.currentExamResult) return;

        document.getElementById('cert-name').textContent = this.currentUser.name;
        document.getElementById('cert-wpm').textContent = this.currentExamResult.wpm;
        document.getElementById('cert-accuracy').textContent = this.currentExamResult.accuracy;
        document.getElementById('cert-score').textContent = this.currentExamResult.score;
        
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('cert-date').textContent = dateStr;

        // Open certificate modal
        document.getElementById('certificate-modal').classList.add('active');
    }

    // ================= SCORECARD CONTROLS =================
    showScorecard(stats) {
        this.currentExamResult = stats;
        
        document.getElementById('scorecard-title').textContent = stats.title || "Challenge Complete!";
        document.getElementById('scorecard-wpm').textContent = stats.wpm;
        document.getElementById('scorecard-accuracy').textContent = `${Math.round(stats.accuracy)}%`;
        document.getElementById('scorecard-errors').textContent = stats.errors;
        document.getElementById('scorecard-score').textContent = `${stats.score}/100`;

        const certBtn = document.getElementById('btn-show-certificate');
        if (stats.showCertificate) {
            certBtn.style.display = 'inline-flex';
        } else {
            certBtn.style.display = 'none';
        }

        this.showScreen('screen-scorecard');
    }

    // ================= MODE NAVIGATION HANDLERS =================
    startBeginnerMode() {
        this.showScreen('screen-beginner');
        this.beginnerGame.start();
    }

    startIntermediateMode() {
        this.showScreen('screen-intermediate');
        this.intermediateGame.start();
    }

    startExamMode() {
        this.showScreen('screen-exam');
        this.examGame.start();
    }

    showLevelSelect() {
        this.showScreen('screen-level-select');
        this.loadUserProgress();
    }
}

// Start core app context once document loads completely
window.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
});
