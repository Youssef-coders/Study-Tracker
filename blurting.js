// Blurting method functionality
class Blurting {
    static init() {
        this.isRunning = false;
        this.timer = null;
        this.timeLeft = 5 * 60; // 5 minutes in seconds
        this.originalTime = this.timeLeft;
        this.setupEventListeners();
        this.updateDisplay();
    }

    static setupEventListeners() {
        // Button event listeners
        const startBtn = document.getElementById('startBlurting');
        const stopBtn = document.getElementById('stopBlurting');
        const clearBtn = document.getElementById('clearBlurting');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.start();
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stop();
            });
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clear();
            });
        }
        
        // Textarea event listeners
        const textarea = document.getElementById('blurtingText');
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.saveText();
            });
            
            // Load saved text
            this.loadText();
        }
    }

    static start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtonStates();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.stop();
                if (window.Notify) {
                    window.Notify.success('Blurting session complete! Great job!');
                }
            }
        }, 1000);
        
        if (window.Notify) {
            window.Notify.info('Blurting session started! Keep writing...');
        }
    }

    static stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.timer);
        this.timer = null;
        this.updateButtonStates();
        
        if (window.Notify) {
            window.Notify.info('Blurting session paused');
        }
    }

    static reset() {
        this.stop();
        this.timeLeft = this.originalTime;
        this.updateDisplay();
    }

    static clear() {
        const textarea = document.getElementById('blurtingText');
        if (textarea) {
            textarea.value = '';
            this.saveText();
        }
        
        if (window.Notify) {
            window.Notify.info('Text cleared');
        }
    }

    static updateButtonStates() {
        const startBtn = document.getElementById('startBlurting');
        const stopBtn = document.getElementById('stopBlurting');
        
        if (startBtn) startBtn.disabled = this.isRunning;
        if (stopBtn) stopBtn.disabled = !this.isRunning;
    }

    static updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        const minutesEl = document.getElementById('blurtMinutes');
        const secondsEl = document.getElementById('blurtSeconds');
        
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    static saveText() {
        const textarea = document.getElementById('blurtingText');
        if (textarea) {
            localStorage.setItem('blurtingText', textarea.value);
        }
    }

    static loadText() {
        const textarea = document.getElementById('blurtingText');
        if (textarea) {
            const savedText = localStorage.getItem('blurtingText');
            if (savedText) {
                textarea.value = savedText;
            }
        }
    }

    static setTime(minutes) {
        this.originalTime = minutes * 60;
        this.timeLeft = this.originalTime;
        this.updateDisplay();
    }
}

// Make Blurting globally available
window.Blurting = Blurting;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Blurting...');
    Blurting.init();
});
