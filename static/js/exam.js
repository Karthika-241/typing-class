/**
 * Exam Mode - Time Cadet
 * Simulates a formal typing exam with a countdown timer, paragraph, and stats tracking.
 */
class ExamGame {
    constructor() {
        this.paragraphs = [
            "Typing is an important computer skill. Practice every day to become faster and more accurate. Keep your hands relaxed and placement on the home row keys!",
            "The quick brown fox jumps over the lazy dog. This fun sentence uses every letter of the English alphabet. Try typing it smoothly without looking at the keys!",
            "Computers help us learn, play, and connect with people around the world. Regular keyboard practice helps you write emails, stories, and codes very easily."
        ];

        this.currentParagraph = "";
        this.currentIndex = 0;
        this.errorsCount = 0;
        this.totalKeystrokes = 0;
        this.startTime = null;
        this.timeRemaining = 60; // 60s exam countdown
        this.isActive = false;

        this.timerInterval = null;
        this.textDisplayEl = null;
        this.inputEl = null;
    }

    start() {
        this.isActive = true;
        this.currentIndex = 0;
        this.errorsCount = 0;
        this.totalKeystrokes = 0;
        this.timeRemaining = 60;
        this.startTime = null;

        this.textDisplayEl = document.getElementById('exam-paragraph-display');
        this.inputEl = document.getElementById('exam-text-input');
        
        this.inputEl.value = "";
        this.inputEl.disabled = false;
        
        document.getElementById('exam-wpm').textContent = '0';
        document.getElementById('exam-accuracy').textContent = '100%';
        document.getElementById('exam-timer').textContent = '60s';

        // Select a random paragraph
        const randIdx = Math.floor(Math.random() * this.paragraphs.length);
        this.currentParagraph = this.paragraphs[randIdx];

        // Format paragraph into letters wrapped in spans for highlighting
        this.renderParagraphSpans();

        // Load virtual keyboard
        app.renderVirtualKeyboard('keyboard-exam-view');
        this.highlightNextKey();

        // Focus text entry area
        this.inputEl.focus();

        // Listen for input and keydowns
        this.inputEl.addEventListener('input', this.handleInput.bind(this));
        
        // Timer check
        this.timerInterval = setInterval(() => {
            this.tickTimer();
        }, 1000);
    }

    stop() {
        this.isActive = false;
        clearInterval(this.timerInterval);
        if (this.inputEl) {
            this.inputEl.disabled = true;
        }
    }

    renderParagraphSpans() {
        this.textDisplayEl.innerHTML = "";
        for (let i = 0; i < this.currentParagraph.length; i++) {
            const span = document.createElement('span');
            span.textContent = this.currentParagraph[i];
            span.id = `exam-char-${i}`;
            this.textDisplayEl.appendChild(span);
        }
        // Mark first letter as active cursor
        const first = document.getElementById('exam-char-0');
        if (first) first.className = "char-current";
    }

    highlightNextKey() {
        // Clear all keyboard highlights
        document.querySelectorAll('#keyboard-exam-view .key').forEach(k => {
            k.classList.remove('highlight-target');
        });

        if (this.currentIndex < this.currentParagraph.length) {
            const nextChar = this.currentParagraph[this.currentIndex].toLowerCase();
            const lookup = nextChar === ' ' ? ' ' : nextChar;
            const keyEl = document.querySelector(`#keyboard-exam-view .key[data-key="${lookup}"]`);
            if (keyEl) {
                keyEl.classList.add('highlight-target');
            }
        }
    }

    handleInput(e) {
        if (!this.isActive) return;

        // Start timer when typing the first character
        if (this.startTime === null) {
            this.startTime = new Date();
        }

        const typedText = this.inputEl.value;
        const textLength = typedText.length;
        
        this.totalKeystrokes++;
        app.playClickSound();

        // Update CSS highlights of letters based on user progress input
        for (let i = 0; i < this.currentParagraph.length; i++) {
            const span = document.getElementById(`exam-char-${i}`);
            if (!span) continue;

            if (i < textLength) {
                // Character was typed
                if (typedText[i] === this.currentParagraph[i]) {
                    span.className = "char-correct";
                } else {
                    span.className = "char-incorrect";
                }
            } else if (i === textLength) {
                // Next target character (cursor position)
                span.className = "char-current";
            } else {
                // Unreached characters
                span.className = "";
            }
        }

        // Adjust tracking index
        const previousIndex = this.currentIndex;
        this.currentIndex = textLength;

        // Calculate count of errors currently present
        let currentErrors = 0;
        for (let i = 0; i < textLength; i++) {
            if (typedText[i] !== this.currentParagraph[i]) {
                currentErrors++;
            }
        }
        
        // If they just typed an incorrect key, play wrong note
        if (this.currentIndex > previousIndex) {
            const lastTypedIndex = this.currentIndex - 1;
            if (typedText[lastTypedIndex] !== this.currentParagraph[lastTypedIndex]) {
                this.errorsCount++;
                app.playWrongSound();
            }
        }

        // Live calculation updates
        this.updateLiveStats(currentErrors);
        this.highlightNextKey();

        // Check if paragraph is fully typed
        if (this.currentIndex >= this.currentParagraph.length) {
            this.submitExam();
        }
    }

    updateLiveStats(currentErrors) {
        if (this.startTime === null) return;

        const timeElapsedSec = (new Date() - this.startTime) / 1000;
        const timeElapsedMin = Math.max(0.01, timeElapsedSec / 60);

        // Standard WPM = (characters typed / 5) / elapsed minutes
        const wpm = Math.round((this.currentIndex / 5) / timeElapsedMin);
        
        // Accuracy = (correct keys / total keystrokes) * 100
        const correctChars = this.currentIndex - currentErrors;
        const accuracy = this.currentIndex > 0 ? Math.round((correctChars / this.currentIndex) * 100) : 100;

        document.getElementById('exam-wpm').textContent = wpm;
        document.getElementById('exam-accuracy').textContent = `${accuracy}%`;
    }

    tickTimer() {
        if (!this.isActive) return;

        if (this.startTime !== null) {
            this.timeRemaining--;
            document.getElementById('exam-timer').textContent = `${this.timeRemaining}s`;

            if (this.timeRemaining <= 0) {
                this.submitExam();
            }
        }
    }

    submitExam() {
        this.stop();

        const durationSeconds = this.startTime ? Math.round((new Date() - this.startTime) / 1000) : 60;
        const typedText = this.inputEl.value;
        const totalTyped = typedText.length;

        // Count typos in the submitted text
        let errors = 0;
        for (let i = 0; i < totalTyped; i++) {
            if (typedText[i] !== this.currentParagraph[i]) {
                errors++;
            }
        }

        // Post statistics payload to Flask backend API
        const payload = {
            user_id: app.currentUser.id,
            exam_type: "Time Cadet Exam",
            typed_chars: totalTyped,
            errors: errors,
            duration: Math.max(1, durationSeconds)
        };

        // Call Flask backend save endpoint
        fetch('/api/exam-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const res = data.result;
                
                app.playFanfare();
                // Render Scorecard
                app.showScorecard({
                    wpm: res.wpm,
                    accuracy: res.accuracy,
                    errors: res.errors,
                    score: res.score,
                    showCertificate: res.score >= 60, // enable certificate if score is 60+ (passing)
                    title: "🏆 Exam Complete!"
                });
            } else {
                alert("Error saving exam: " + data.message);
                app.showLevelSelect();
            }
        })
        .catch(err => {
            console.error("Exam save API failed", err);
            // Fallback locally for students if backend drops
            const fallbackAcc = totalTyped > 0 ? ((totalTyped - errors) / totalTyped) * 100 : 100;
            const minutes = durationSeconds / 60.0;
            const fallbackWpm = (totalTyped / 5) / minutes;
            const fallbackScore = Math.round(fallbackAcc * 0.8 + Math.min(fallbackWpm, 50) * 0.4);
            
            app.showScorecard({
                wpm: fallbackWpm,
                accuracy: fallbackAcc,
                errors: errors,
                score: fallbackScore,
                showCertificate: fallbackScore >= 60,
                title: "🏆 Exam Complete (Offline Fallback)"
            });
        });
    }
}

// Attach class to window
window.ExamGame = ExamGame;
