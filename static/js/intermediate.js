/**
 * Intermediate Mode - Balloon Popper
 * Kids type complete short words to pop floating balloons.
 */
class IntermediateGame {
    constructor() {
        this.words = [
            "cat", "dog", "sun", "toy", "ball", "tree", "book", "star", "frog",
            "cake", "lion", "fish", "bird", "kite", "door", "milk", "happy",
            "apple", "school", "pencil", "clock", "water", "house", "smile",
            "bubble", "banana", "rabbit", "garden", "window", "crayon"
        ];
        
        this.activeBalloons = [];
        this.score = 0;
        this.popsCount = 0;
        this.timeRemaining = 60; // 60 seconds timer
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        
        this.gameInterval = null;
        this.spawnInterval = null;
        this.timerInterval = null;
        
        this.isActive = false;
        this.container = null;
        this.inputEl = null;

        // Custom balloon pastel color array
        this.colors = ['#ff7675', '#74b9ff', '#55efc4', '#ffeaa7', '#a29bfe', '#fd79a8', '#fdcb6e'];
    }

    start() {
        this.isActive = true;
        this.score = 0;
        this.popsCount = 0;
        this.timeRemaining = 60;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;
        this.activeBalloons = [];
        
        this.container = document.getElementById('balloon-container');
        this.container.innerHTML = ''; // Clear container

        this.inputEl = document.getElementById('inter-word-input');
        this.inputEl.value = '';
        this.inputEl.disabled = false;
        this.inputEl.focus();

        document.getElementById('inter-score').textContent = '0';
        document.getElementById('inter-pops').textContent = '0';
        document.getElementById('inter-timer').textContent = '60s';
        document.getElementById('active-word-display').textContent = '---';

        // Render keyboard helper
        app.renderVirtualKeyboard('keyboard-intermediate-view');

        // Setup event listener for input change
        this.inputEl.addEventListener('input', this.handleInput.bind(this));
        
        // Start game loops
        this.startGameLoops();
        this.spawnBalloon(); // Spawn first balloon immediately
    }

    stop() {
        this.isActive = false;
        
        // Clear all running intervals
        clearInterval(this.gameInterval);
        clearInterval(this.spawnInterval);
        clearInterval(this.timerInterval);

        if (this.inputEl) {
            this.inputEl.value = '';
            this.inputEl.disabled = true;
        }
    }

    startGameLoops() {
        // 1. Balloon movement updater loop (ticks every 40ms for smooth 25fps animation)
        this.gameInterval = setInterval(() => {
            this.updateBalloons();
        }, 40);

        // 2. Balloon spawner loop (ticks every 2.5 seconds)
        this.spawnInterval = setInterval(() => {
            this.spawnBalloon();
        }, 2500);

        // 3. Countdown timer loop (ticks every 1 second)
        this.timerInterval = setInterval(() => {
            this.tickTimer();
        }, 1000);
    }

    spawnBalloon() {
        if (!this.isActive) return;

        // Choose a random word
        const wordIndex = Math.floor(Math.random() * this.words.length);
        const word = this.words[wordIndex];

        // Ensure we don't spawn a word that is already active on screen
        if (this.activeBalloons.some(b => b.word === word)) {
            return;
        }

        // Create Balloon DOM Node
        const balloonNode = document.createElement('div');
        balloonNode.className = 'balloon';
        
        // Visuals
        const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        balloonNode.style.backgroundColor = randomColor;
        balloonNode.style.left = `${Math.floor(Math.random() * 70) + 10}%`; // horizontal position (10% to 80%)
        balloonNode.style.bottom = `-80px`;
        
        // Inner word label
        balloonNode.textContent = word;

        // Balloon string
        const stringNode = document.createElement('div');
        stringNode.className = 'balloon-string';
        balloonNode.appendChild(stringNode);

        this.container.appendChild(balloonNode);

        // Track state representation
        this.activeBalloons.push({
            word: word,
            element: balloonNode,
            bottom: -80,
            speed: Math.random() * 1.2 + 0.8 // float speed offset
        });

        // Set active target highlight if it's the only/first balloon
        this.updateActiveTargetDisplay();
    }

    updateBalloons() {
        if (!this.isActive) return;

        for (let i = this.activeBalloons.length - 1; i >= 0; i--) {
            const balloon = this.activeBalloons[i];
            
            // Increment float position upward
            balloon.bottom += balloon.speed;
            balloon.element.style.bottom = `${balloon.bottom}px`;

            // If balloon floats past container limit (260px)
            if (balloon.bottom > 250) {
                // Balloon floated away
                balloon.element.remove();
                this.activeBalloons.splice(i, 1);
                
                // Audio buzz warning
                app.playWrongSound();
                this.updateActiveTargetDisplay();
            }
        }
    }

    updateActiveTargetDisplay() {
        const wordDisplay = document.getElementById('active-word-display');
        
        if (this.activeBalloons.length > 0) {
            // Target the lowest balloon (the one closest to floating away)
            const target = this.activeBalloons[0];
            wordDisplay.textContent = target.word;
            
            // Highlight matching next character on virtual keyboard
            const currentTyped = this.inputEl.value.toLowerCase();
            if (target.word.startsWith(currentTyped)) {
                const nextChar = target.word[currentTyped.length];
                if (nextChar) {
                    this.highlightKeyboardTarget(nextChar);
                }
            }
        } else {
            wordDisplay.textContent = '---';
            this.clearKeyboardHighlight();
        }
    }

    highlightKeyboardTarget(char) {
        this.clearKeyboardHighlight();
        const element = document.querySelector(`#keyboard-intermediate-view .key[data-key="${char.toLowerCase()}"]`);
        if (element) {
            element.classList.add('highlight-target');
        }
    }

    clearKeyboardHighlight() {
        document.querySelectorAll('#keyboard-intermediate-view .key').forEach(k => {
            k.classList.remove('highlight-target');
        });
    }

    handleInput(e) {
        if (!this.isActive || this.activeBalloons.length === 0) {
            this.inputEl.value = '';
            return;
        }

        const typed = this.inputEl.value.trim().toLowerCase();
        const currentTarget = this.activeBalloons[0]; // Lowest active balloon is primary target
        
        this.totalKeystrokes++;

        if (typed === currentTarget.word) {
            // Word successfully completed!
            this.popsCount++;
            this.score += currentTarget.word.length * 10;
            this.correctKeystrokes += currentTarget.word.length;

            document.getElementById('inter-score').textContent = this.score;
            document.getElementById('inter-pops').textContent = this.popsCount;

            // Trigger Pop animation sequence
            app.playBalloonPop();
            currentTarget.element.classList.add('pop-animation');
            
            const elementToPop = currentTarget.element;
            setTimeout(() => elementToPop.remove(), 300);

            // Dequeue balloon state
            this.activeBalloons.shift();
            
            // Clear input box
            this.inputEl.value = '';
            
            // Load next word stats
            this.updateActiveTargetDisplay();
        } else if (currentTarget.word.startsWith(typed)) {
            // Typed characters match target word prefix
            app.playClickSound();
            this.correctKeystrokes++;
            this.updateActiveTargetDisplay();
        } else {
            // Typo feedback
            app.playWrongSound();
            
            // Visual key feedback for last typed character
            const lastChar = typed[typed.length - 1];
            const pressedKey = document.querySelector(`#keyboard-intermediate-view .key[data-key="${lastChar}"]`);
            if (pressedKey) {
                pressedKey.classList.add('key-wrong');
                setTimeout(() => pressedKey.classList.remove('key-wrong'), 200);
            }

            // Remove last character from input to help user fix it
            this.inputEl.value = typed.substring(0, typed.length - 1);
        }
    }

    tickTimer() {
        this.timeRemaining--;
        document.getElementById('inter-timer').textContent = `${this.timeRemaining}s`;

        if (this.timeRemaining <= 0) {
            this.endGame();
        }
    }

    endGame() {
        this.stop();
        
        // Compute final score metrics
        const elapsedMinutes = 1.0; // 60s
        const rawWpm = (this.correctKeystrokes / 5) / elapsedMinutes;
        const accuracy = (this.correctKeystrokes / Math.max(1, this.totalKeystrokes)) * 100;
        
        // Save progress payload
        const payload = {
            user_id: app.currentUser.id,
            level: 'intermediate',
            lesson: 'Balloon Popper Challenge',
            words_completed: this.popsCount,
            accuracy: accuracy,
            wpm: rawWpm
        };

        app.saveProgressApi(payload);

        // Render Scorecard
        setTimeout(() => {
            app.playFanfare();
            app.showScorecard({
                wpm: rawWpm,
                accuracy: accuracy,
                errors: this.totalKeystrokes - this.correctKeystrokes,
                score: Math.min(100, Math.round(accuracy * 0.7 + Math.min(rawWpm, 50) * 0.6)),
                showCertificate: false,
                title: "🎈 Intermediate Challenge Complete!"
            });
        }, 800);
    }
}

// Attach class to window
window.IntermediateGame = IntermediateGame;
