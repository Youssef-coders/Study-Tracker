// Flashcards functionality with sets
class Flashcards {
    static init() {
        console.log('Flashcards.init() called');
        this.loadSubjects();
        this.loadFlashcardSets();
        this.setupEventListeners();
        console.log('Flashcards.init() completed');
    }

    static setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Add flashcard set button
        const addSetBtn = document.getElementById('addFlashcardSet');
        console.log('Add set button found:', addSetBtn);
        if (addSetBtn) {
            addSetBtn.addEventListener('click', () => {
                console.log('Add set button clicked');
                this.openFlashcardSetModal();
            });
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
        // This would open a study mode for the specific set
        if (window.Notify) {
            window.Notify.info('Study mode coming soon!');
        }
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

