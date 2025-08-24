// Flashcards functionality with sets
class Flashcards {
    static init() {
        console.log('Flashcards.init() called');
        this.currentSetId = null;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            this.loadSubjects();
            this.loadFlashcardSets();
            this.setupEventListeners();
            console.log('Flashcards.init() completed');
        }, 100);
    }

    static setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Add flashcard set button
        const addSetBtn = document.getElementById('addFlashcardSet');
        console.log('Add set button found:', addSetBtn);
        if (addSetBtn) {
            addSetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Add set button clicked');
                this.openFlashcardSetModal();
            });
            
            // Add some visual feedback
            addSetBtn.style.cursor = 'pointer';
            addSetBtn.style.userSelect = 'none';
        }

        // Flashcard set form
        const setForm = document.getElementById('flashcardSetForm');
        console.log('Set form found:', setForm);
        if (setForm) {
            setForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Set form submitted');
                this.createFlashcardSet();
            });
        }

        // Subject filter
        const subjectSelect = document.getElementById('subjectSelect');
        console.log('Subject select found:', subjectSelect);
        if (subjectSelect) {
            subjectSelect.addEventListener('change', () => {
                console.log('Subject filter changed');
                this.filterFlashcardSets();
            });
        }

        // Flashcard form
        const flashcardForm = document.getElementById('flashcardForm');
        console.log('Flashcard form found:', flashcardForm);
        if (flashcardForm) {
            flashcardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Flashcard form submitted');
                this.saveFlashcard();
            });
        }
        
        console.log('Event listeners setup completed');
    }

    static loadSubjects() {
        console.log('Loading subjects...');
        let subjects = JSON.parse(localStorage.getItem('subjects') || '[]');
        
        // If no subjects exist, create default ones based on the existing subject pages
        if (subjects.length === 0) {
            console.log('No subjects found, creating default subjects...');
            subjects = [
                { name: 'Math' },
                { name: 'Physics' },
                { name: 'Chemistry' },
                { name: 'Biology' },
                { name: 'English' },
                { name: 'Arabic' },
                { name: 'Business' },
                { name: 'Accounting' }
            ];
            localStorage.setItem('subjects', JSON.stringify(subjects));
        }
        
        console.log('Subjects found/created:', subjects);
        
        const subjectSelect = document.getElementById('setSubject');
        const filterSelect = document.getElementById('subjectSelect');
        
        console.log('Subject select elements:', { subjectSelect, filterSelect });
        
        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="">Select Subject</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.name;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
            });
        }
        
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All Subjects</option>';
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.name;
                option.textContent = subject.name;
                filterSelect.appendChild(option);
            });
        }
        console.log('Subjects loaded');
    }

    static loadFlashcardSets() {
        console.log('Loading flashcard sets...');
        const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
        const container = document.getElementById('flashcardSets');
        
        console.log('Sets found:', sets);
        console.log('Container found:', container);
        
        if (!container) {
            console.log('No container found, returning');
            return;
        }
        
        if (sets.length === 0) {
            console.log('No sets found, showing empty state');
            container.innerHTML = '<div class="empty-state">No flashcard sets yet. Create your first set!</div>';
            return;
        }
        
        console.log('Rendering sets...');
        container.innerHTML = sets.map(set => `
            <div class="flashcard-set" data-subject="${set.subject}">
                <div class="set-header">
                    <div class="set-info">
                        <h4>${this.escapeHtml(set.name)}</h4>
                        <span class="set-subject">${this.escapeHtml(set.subject)}</span>
                        ${set.description ? `<p class="set-description">${this.escapeHtml(set.description)}</p>` : ''}
                    </div>
                    <div class="set-stats">
                        <p class="card-count">${set.cards ? set.cards.length : 0}</p>
                        <p class="count-label">cards</p>
                    </div>
                </div>
                <div class="set-actions">
                    <button onclick="Flashcards.openFlashcardSet('${set.id}')" class="study-btn">Study</button>
                    <button onclick="Flashcards.addCardToSet('${set.id}')" class="add-card-btn">Add Card</button>
                    <button onclick="Flashcards.deleteFlashcardSet('${set.id}')" class="delete-set-btn">Delete</button>
                </div>
            </div>
        `).join('');
        console.log('Sets rendered');
    }

    static filterFlashcardSets() {
        const selectedSubject = document.getElementById('subjectSelect').value;
        const sets = document.querySelectorAll('.flashcard-set');
        
        sets.forEach(set => {
            if (!selectedSubject || set.dataset.subject === selectedSubject) {
                set.style.display = 'block';
            } else {
                set.style.display = 'none';
            }
        });
    }

    static openFlashcardSetModal() {
        const modal = document.getElementById('flashcardSetModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('setName').focus();
        }
    }

    static closeFlashcardSetModal() {
        const modal = document.getElementById('flashcardSetModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('flashcardSetForm').reset();
        }
    }

    static createFlashcardSet() {
        const name = document.getElementById('setName').value.trim();
        const subject = document.getElementById('setSubject').value;
        const description = document.getElementById('setDescription').value.trim();
        
        if (!name || !subject) {
            if (window.Notify) {
                window.Notify.warn('Please fill in the set name and subject');
            }
            return;
        }
        
        const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
        const newSet = {
            id: Date.now().toString(),
            name: name,
            subject: subject,
            description: description,
            cards: [],
            created: new Date().toISOString()
        };
        
        sets.push(newSet);
        localStorage.setItem('flashcardSets', JSON.stringify(sets));
        
        this.closeFlashcardSetModal();
        this.loadFlashcardSets();
        
        if (window.Notify) {
            window.Notify.success('Flashcard set created successfully!');
        }
    }

    static deleteFlashcardSet(setId) {
        if (!confirm('Are you sure you want to delete this flashcard set? This action cannot be undone.')) {
            return;
        }
        
        const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
        const filteredSets = sets.filter(set => set.id !== setId);
        localStorage.setItem('flashcardSets', JSON.stringify(filteredSets));
        
        this.loadFlashcardSets();
        
        if (window.Notify) {
            window.Notify.success('Flashcard set deleted');
        }
    }

    static openFlashcardSet(setId) {
        console.log('Opening study mode for set:', setId);
        this.currentSetId = setId;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        
        const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
        const set = sets.find(s => s.id === setId);
        
        if (!set || !set.cards || set.cards.length === 0) {
            if (window.Notify) {
                window.Notify.warn('No cards in this set to study!');
            }
            return;
        }
        
        this.showStudyMode(set);
    }
    
    static showStudyMode(set) {
        const container = document.getElementById('flashcardSets');
        if (!container) return;
        
        const studyHTML = `
            <div class="study-mode">
                <div class="study-header">
                    <h2>${this.escapeHtml(set.name)} - Study Mode</h2>
                    <p>Card ${this.currentCardIndex + 1} of ${set.cards.length}</p>
                    <button onclick="Flashcards.exitStudyMode()" class="exit-study-btn">Exit Study Mode</button>
                </div>
                
                <div class="flashcard-study">
                    <div class="flashcard" onclick="Flashcards.flipCard()">
                        <div class="flashcard-inner ${this.isFlipped ? 'flipped' : ''}">
                            <div class="flashcard-front">
                                <p>${this.escapeHtml(set.cards[this.currentCardIndex].front)}</p>
                                <div class="card-hint">Click to flip</div>
                            </div>
                            <div class="flashcard-back">
                                <p>${this.escapeHtml(set.cards[this.currentCardIndex].back)}</p>
                                <div class="card-hint">Click to flip back</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="study-controls">
                    <button onclick="Flashcards.previousCard()" class="study-btn" ${this.currentCardIndex === 0 ? 'disabled' : ''}>Previous</button>
                    <button onclick="Flashcards.nextCard()" class="study-btn" ${this.currentCardIndex === set.cards.length - 1 ? 'disabled' : ''}>Next</button>
                </div>
                
                <div class="study-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((this.currentCardIndex + 1) / set.cards.length) * 100}%"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = studyHTML;
    }
    
    static flipCard() {
        this.isFlipped = !this.isFlipped;
        const flashcard = document.querySelector('.flashcard');
        if (flashcard) {
            flashcard.classList.toggle('flipped', this.isFlipped);
        }
    }
    
    static nextCard() {
        const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
        const set = sets.find(s => s.id === this.currentSetId);
        
        if (this.currentCardIndex < set.cards.length - 1) {
            this.currentCardIndex++;
            this.isFlipped = false;
            this.showStudyMode(set);
        }
    }
    
    static previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = false;
            const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
            const set = sets.find(s => s.id === this.currentSetId);
            this.showStudyMode(set);
        }
    }
    
    static exitStudyMode() {
        this.currentSetId = null;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.loadFlashcardSets();
    }

    static addCardToSet(setId) {
        // Store the current set ID for the flashcard modal
        this.currentSetId = setId;
        
        // Open the flashcard modal
        const modal = document.getElementById('flashcardModal');
        if (modal) {
            modal.style.display = 'block';
            document.getElementById('frontText').focus();
        }
    }

    static saveFlashcard() {
        const frontText = document.getElementById('frontText').value.trim();
        const backText = document.getElementById('backText').value.trim();
        
        if (!frontText || !backText) {
            if (window.Notify) {
                window.Notify.warn('Please fill in both front and back of the flashcard');
            }
            return;
        }
        
        if (!this.currentSetId) {
            if (window.Notify) {
                window.Notify.error('No flashcard set selected');
            }
            return;
        }
        
        const sets = JSON.parse(localStorage.getItem('flashcardSets') || '[]');
        const setIndex = sets.findIndex(set => set.id === this.currentSetId);
        
        if (setIndex === -1) {
            if (window.Notify) {
                window.Notify.error('Flashcard set not found');
            }
            return;
        }
        
        const newCard = {
            id: Date.now().toString(),
            front: frontText,
            back: backText,
            created: new Date().toISOString()
        };
        
        if (!sets[setIndex].cards) {
            sets[setIndex].cards = [];
        }
        
        sets[setIndex].cards.push(newCard);
        localStorage.setItem('flashcardSets', JSON.stringify(sets));
        
        this.closeFlashcardModal();
        this.loadFlashcardSets();
        
        if (window.Notify) {
            window.Notify.success('Flashcard added successfully!');
        }
    }

    static closeFlashcardModal() {
        const modal = document.getElementById('flashcardModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('flashcardForm').reset();
        }
        this.currentSetId = null;
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global functions for modal close
function closeFlashcardSetModal() {
    Flashcards.closeFlashcardSetModal();
}

function closeFlashcardModal() {
    Flashcards.closeFlashcardModal();
}

// Make Flashcards globally available
window.Flashcards = Flashcards;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Flashcards...');
    Flashcards.init();
});

