/**
 * Beginner Mode - Toy Jumper
 * Teaches home row keys step-by-step using sequences, highlights, and companion toys.
 */
class BeginnerGame {
    constructor() {
        // Step-by-step lessons progression structure
        this.lessons = [
            {
                title: "Lesson 1: Meet the Home Row",
                sequences: ["A", "S", "D", "F", "J", "K", "L", ";"]
            },
            {
                title: "Lesson 2: Left Hand",
                sequences: ["ASDF", "FDSA", "AF", "SD", "DF"]
            },
            {
                title: "Lesson 3: Right Hand",
                sequences: ["JKL;", ";LKJ", "JL", "K;"]
            },
            {
                title: "Lesson 4: Both Hands",
                sequences: ["AJ", "SK", "DL", "F;", "ASJK", "DFL;"]
            },
            {
                title: "Lesson 5: Home Row Patterns",
                sequences: ["ASDF", "JKL;", "FDSA", ";LKJ", "ASJK", "DFL;"]
            },
            {
                title: "Lesson 6: Simple Words",
                sequences: ["sad", "lad", "ask", "all", "fall", "dad"]
            }
        ];
        
        this.currentLessonIndex = 0;
        this.currentSequenceIndex = 0;
        this.currentCharacterIndex = 0;
        
        this.keysPressedCount = 0;
        this.errorsCount = 0;
        this.totalKeystrokes = 0;
        this.selectedToy = 'teddy';
        this.isActive = false;

        // Tracks car distance animation placement percentage
        this.carDistance = 0;

        // Key to finger helper mapping
        this.fingerMap = {
            'a': '👈 LEFT PINKY', 'q': '👈 LEFT PINKY', 'z': '👈 LEFT PINKY', '1': '👈 LEFT PINKY',
            's': '👈 LEFT RING', 'w': '👈 LEFT RING', 'x': '👈 LEFT RING', '2': '👈 LEFT RING',
            'd': '👈 LEFT MIDDLE', 'e': '👈 LEFT MIDDLE', 'c': '👈 LEFT MIDDLE', '3': '👈 LEFT MIDDLE',
            'f': '👈 LEFT INDEX', 'r': '👈 LEFT INDEX', 'v': '👈 LEFT INDEX', 't': '👈 LEFT INDEX', 'g': '👈 LEFT INDEX', 'b': '👈 LEFT INDEX', '4': '👈 LEFT INDEX', '5': '👈 LEFT INDEX',
            ' ': '👇 EITHER THUMB',
            'j': '👉 RIGHT INDEX', 'u': '👉 RIGHT INDEX', 'n': '👉 RIGHT INDEX', 'y': '👉 RIGHT INDEX', 'h': '👉 RIGHT INDEX', 'm': '👉 RIGHT INDEX', '6': '👉 RIGHT INDEX', '7': '👉 RIGHT INDEX',
            'k': '👉 RIGHT MIDDLE', 'i': '👉 RIGHT MIDDLE', ',': '👉 RIGHT MIDDLE', '8': '👉 RIGHT MIDDLE',
            'l': '👉 RIGHT RING', 'o': '👉 RIGHT RING', '.': '👉 RIGHT RING', '9': '👉 RIGHT RING',
            ';': '👉 RIGHT PINKY', 'p': '👉 RIGHT PINKY', '/': '👉 RIGHT PINKY', '0': '👉 RIGHT PINKY', '-': '👉 RIGHT PINKY', '=': '👉 RIGHT PINKY', '[': '👉 RIGHT PINKY', ']': '👉 RIGHT PINKY', '\'': '👉 RIGHT PINKY'
        };

        this.initDomEvents();
    }

    initDomEvents() {
        // Toy Selector click event handlers
        document.querySelectorAll('.toy-opt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.toy-opt-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.selectedToy = btn.dataset.toy;
                
                // Toggle active SVG element inside container
                document.querySelectorAll('.toy-stage .toy-svg').forEach(svg => {
                    svg.classList.remove('active');
                });
                
                const activeSvg = document.getElementById(`svg-${this.selectedToy}`);
                if (activeSvg) {
                    activeSvg.classList.add('active');
                }
            });
        });
    }

    start() {
        this.isActive = true;
        this.currentSequenceIndex = 0;
        this.currentCharacterIndex = 0;
        this.keysPressedCount = 0;
        this.errorsCount = 0;
        this.totalKeystrokes = 0;
        this.carDistance = 0;

        // Render virtual keyboard
        app.renderVirtualKeyboard('keyboard-beginner-view');
        
        // Populates selector dropdown options dynamically
        this.populateLessonSelector();

        // Check if there is cached progress in user object and set starting level
        if (app.latestBeginnerLesson) {
            const cachedIdx = this.lessons.findIndex(l => l.title === app.latestBeginnerLesson);
            if (cachedIdx !== -1) {
                // If they completed Lesson X, start them on Lesson X+1 (unless they completed Lesson 6)
                if (cachedIdx < this.lessons.length - 1) {
                    this.currentLessonIndex = cachedIdx + 1;
                } else {
                    this.currentLessonIndex = cachedIdx;
                }
            }
        } else {
            this.currentLessonIndex = 0;
        }

        // Match selected dropdown element with current index
        const select = document.getElementById('beginner-lesson-select');
        if (select) {
            select.value = this.currentLessonIndex;
        }

        this.loadLesson();

        // Attach target keystroke keydown listener
        this.boundHandleKeystroke = this.handleKeystroke.bind(this);
        window.addEventListener('keydown', this.boundHandleKeystroke);
    }

    stop() {
        this.isActive = false;
        if (this.boundHandleKeystroke) {
            window.removeEventListener('keydown', this.boundHandleKeystroke);
            this.boundHandleKeystroke = null;
        }
    }

    populateLessonSelector() {
        const select = document.getElementById('beginner-lesson-select');
        if (!select) return;

        select.innerHTML = '';
        this.lessons.forEach((lesson, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = lesson.title;
            select.appendChild(opt);
        });
    }

    selectLessonFromDropdown(value) {
        this.currentLessonIndex = parseInt(value);
        this.restartCurrentLesson();
    }

    restartCurrentLesson() {
        this.currentSequenceIndex = 0;
        this.currentCharacterIndex = 0;
        this.keysPressedCount = 0;
        this.errorsCount = 0;
        this.totalKeystrokes = 0;
        this.loadLesson();
    }

    loadLesson() {
        const lesson = this.lessons[this.currentLessonIndex];
        this.loadSequence();
    }

    loadSequence() {
        const lesson = this.lessons[this.currentLessonIndex];
        const sequence = lesson.sequences[this.currentSequenceIndex];
        
        const displayContainer = document.getElementById('beginner-sequence-display');
        if (!displayContainer) return;
        
        displayContainer.innerHTML = '';
        for (let i = 0; i < sequence.length; i++) {
            const span = document.createElement('span');
            span.className = 'seq-char';
            span.textContent = sequence[i] === ' ' ? 'SPACE' : sequence[i];
            span.id = `beginner-char-${i}`;
            displayContainer.appendChild(span);
        }

        this.updateCursorAndInstructions();
    }

    updateCursorAndInstructions() {
        const lesson = this.lessons[this.currentLessonIndex];
        const sequence = lesson.sequences[this.currentSequenceIndex];
        
        // Sequence fully typed check
        if (this.currentCharacterIndex >= sequence.length) {
            this.completeSequence();
            return;
        }

        // Apply visual highlights to sequence spans
        for (let i = 0; i < sequence.length; i++) {
            const span = document.getElementById(`beginner-char-${i}`);
            if (span) {
                if (i < this.currentCharacterIndex) {
                    span.className = 'seq-char char-completed';
                } else if (i === this.currentCharacterIndex) {
                    span.className = 'seq-char char-active';
                } else {
                    span.className = 'seq-char';
                }
            }
        }

        const targetChar = sequence[this.currentCharacterIndex];
        const displayCharName = targetChar === ' ' ? 'SPACE' : targetChar.toUpperCase();
        
        // Highlight active key on virtual keyboard
        this.highlightKeyboardTarget(targetChar);

        // Update instruction text label
        const instEl = document.getElementById('beginner-instruction-text');
        if (instEl) {
            instEl.textContent = `Press ${displayCharName}`;
        }

        // Update finger indicator guides
        this.updateFingerGuide(targetChar);

        // Render progress calculations in real-time
        this.updateLessonProgress();
    }

    highlightKeyboardTarget(char) {
        // Clear all previous highlight classes
        document.querySelectorAll('#keyboard-beginner-view .key').forEach(k => {
            k.classList.remove('highlight-target');
        });

        // Add class to active target character
        const element = document.querySelector(`#keyboard-beginner-view .key[data-key="${char.toLowerCase()}"]`);
        if (element) {
            element.classList.add('highlight-target');
        }
    }

    updateFingerGuide(char) {
        const guideEl = document.getElementById('beginner-finger-guide');
        if (!guideEl) return;

        const fingerText = this.fingerMap[char.toLowerCase()] || 'ANY';
        guideEl.innerHTML = `Use your <span class="finger-name highlight">${fingerText}</span> finger!`;
    }

    updateLessonProgress() {
        const lesson = this.lessons[this.currentLessonIndex];
        const totalChars = lesson.sequences.reduce((sum, seq) => sum + seq.length, 0);
        
        let completedChars = 0;
        for (let i = 0; i < this.currentSequenceIndex; i++) {
            completedChars += lesson.sequences[i].length;
        }
        completedChars += this.currentCharacterIndex;

        const pct = Math.round((completedChars / totalChars) * 100);
        
        const fillBar = document.getElementById('beginner-lesson-progress-fill');
        const textLabel = document.getElementById('beginner-lesson-progress-text');
        
        if (fillBar) fillBar.style.width = `${pct}%`;
        if (textLabel) textLabel.textContent = `${pct}% Complete (${completedChars} / ${totalChars} keys)`;
    }

    completeSequence() {
        const lesson = this.lessons[this.currentLessonIndex];
        this.currentSequenceIndex++;
        
        if (this.currentSequenceIndex >= lesson.sequences.length) {
            this.completeLesson();
        } else {
            this.currentCharacterIndex = 0;
            this.loadSequence();
        }
    }

    completeLesson() {
        // Stop listener, show achievement complete popup
        this.stop();
        app.playFanfare();

        const accuracy = (this.keysPressedCount / Math.max(1, this.totalKeystrokes)) * 100;
        
        document.getElementById('lesson-complete-title').textContent = `${this.lessons[this.currentLessonIndex].title} Completed!`;
        document.getElementById('lesson-complete-keys').textContent = this.keysPressedCount;
        document.getElementById('lesson-complete-accuracy').textContent = `${Math.round(accuracy)}%`;
        
        document.getElementById('beginner-lesson-complete-modal').classList.add('active');

        // Persist lesson progress on server
        this.saveProgress(accuracy);
    }

    saveProgress(accuracy) {
        const lesson = this.lessons[this.currentLessonIndex];
        const payload = {
            user_id: app.currentUser.id,
            level: 'beginner',
            lesson: lesson.title,
            words_completed: this.keysPressedCount,
            accuracy: accuracy,
            wpm: 0.0 // no countdown/speed scores in Beginner
        };
        app.saveProgressApi(payload);
    }

    loadNextLesson() {
        document.getElementById('beginner-lesson-complete-modal').classList.remove('active');
        
        if (this.currentLessonIndex < this.lessons.length - 1) {
            this.currentLessonIndex++;
            
            const select = document.getElementById('beginner-lesson-select');
            if (select) select.value = this.currentLessonIndex;

            this.currentSequenceIndex = 0;
            this.currentCharacterIndex = 0;
            this.keysPressedCount = 0;
            this.errorsCount = 0;
            this.totalKeystrokes = 0;

            // Re-bind listeners and reload
            this.boundHandleKeystroke = this.handleKeystroke.bind(this);
            window.addEventListener('keydown', this.boundHandleKeystroke);
            this.isActive = true;
            
            this.loadLesson();
        } else {
            alert("🎉 Awesome Cadet! You successfully completed all home row beginner drills!");
            app.showLevelSelect();
        }
    }

    handleKeystroke(e) {
        if (!this.isActive) return;

        // Block defaults
        if (e.key === ' ' || e.key === 'Tab') {
            e.preventDefault();
        }

        // Ignore meta characters
        if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Enter' && e.key !== ' ') {
            return;
        }

        const pressed = e.key.toLowerCase();
        const lesson = this.lessons[this.currentLessonIndex];
        const sequence = lesson.sequences[this.currentSequenceIndex];
        const target = sequence[this.currentCharacterIndex].toLowerCase();

        this.totalKeystrokes++;

        const targetKeyEl = document.querySelector(`#keyboard-beginner-view .key[data-key="${target}"]`);
        const pressedKeyEl = document.querySelector(`#keyboard-beginner-view .key[data-key="${pressed}"]`);

        if (pressed === target) {
            // Correct click
            this.keysPressedCount++;
            this.currentCharacterIndex++;

            app.playClickSound();
            app.playCorrectSound();

            if (targetKeyEl) {
                targetKeyEl.classList.add('key-correct');
                setTimeout(() => targetKeyEl.classList.remove('key-correct'), 200);
            }

            // Animate cartoon SVGs
            this.animateToy();

            // Next character
            this.updateCursorAndInstructions();
        } else {
            // Mistake
            this.errorsCount++;
            app.playWrongSound();

            if (pressedKeyEl) {
                pressedKeyEl.classList.add('key-wrong');
                setTimeout(() => pressedKeyEl.classList.remove('key-wrong'), 200);
            }
        }
    }

    animateToy() {
        if (this.selectedToy === 'teddy') {
            const teddy = document.getElementById('svg-teddy');
            const arm = document.getElementById('teddy-left-arm');
            if (teddy && arm) {
                teddy.classList.add('teddy-jump');
                arm.classList.add('teddy-wave-arm');
                setTimeout(() => {
                    teddy.classList.remove('teddy-jump');
                    arm.classList.remove('teddy-wave-arm');
                }, 500);
            }
        } 
        else if (this.selectedToy === 'robot') {
            const robot = document.getElementById('svg-robot');
            const antenna = document.getElementById('robot-antenna-tip');
            const eyeL = document.getElementById('robot-eye-left');
            const eyeR = document.getElementById('robot-eye-right');
            if (robot) {
                robot.classList.add('robot-jump');
                if (antenna) antenna.classList.add('robot-spin-antenna');
                if (eyeL) eyeL.classList.add('robot-glow-eyes');
                if (eyeR) eyeR.classList.add('robot-glow-eyes');
                setTimeout(() => {
                    robot.classList.remove('robot-jump');
                    if (antenna) antenna.classList.remove('robot-spin-antenna');
                    if (eyeL) eyeL.classList.remove('robot-glow-eyes');
                    if (eyeR) eyeR.classList.remove('robot-glow-eyes');
                }, 400);
            }
        } 
        else if (this.selectedToy === 'car') {
            const car = document.getElementById('svg-car');
            const wheelL = document.getElementById('car-wheel-left');
            const wheelR = document.getElementById('car-wheel-right');
            if (car) {
                this.carDistance += 10;
                if (this.carDistance > 100) {
                    this.carDistance = 0;
                }
                car.style.left = `${this.carDistance}%`;
                if (wheelL) wheelL.classList.add('wheel-spin');
                if (wheelR) wheelR.classList.add('wheel-spin');
                setTimeout(() => {
                    if (wheelL) wheelL.classList.remove('wheel-spin');
                    if (wheelR) wheelR.classList.remove('wheel-spin');
                }, 300);
            }
        }
    }
}

// Attach object reference
window.BeginnerGame = BeginnerGame;
