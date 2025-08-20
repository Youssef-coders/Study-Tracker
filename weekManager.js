class WeekManager {
  static init() {
    console.log('WeekManager initializing...');
    this.setupWeekClick();
    this.loadWeeks();
    console.log('WeekManager initialized');
  }

  static setupWeekClick() {
    // Add click event only to week display
    document.addEventListener('click', (e) => {
      console.log('Click detected on:', e.target);
      console.log('Classes:', e.target.classList);
      console.log('Contains week-display:', e.target.classList.contains('week-display'));
      
      if (e.target.classList.contains('week-display')) {
        console.log('Week display clicked, opening modal...');
        this.showWeekModal();
      }
    });
  }

  static loadWeeks() {
    let weeks = LocalStorageManager.load('weekList');
    if (!weeks) {
      // Initialize with default weeks 1-11
      weeks = Array.from({length: 11}, (_, i) => i + 1);
      LocalStorageManager.save('weekList', weeks);
    }
    return weeks;
  }

  static getTotalWeeks() {
    const weeks = this.loadWeeks();
    return weeks.length;
  }

  static addWeek() {
    const weeks = this.loadWeeks();
    const nextWeek = Math.max(...weeks) + 1;
    weeks.push(nextWeek);
    LocalStorageManager.save('weekList', weeks);
    
    // Update display
    this.updateWeekDisplay();
    
    // Show success notification
    try {
      Notify && Notify.success(`Week ${nextWeek} added!`);
    } catch(e) {}
    
    return nextWeek;
  }

  static deleteWeek(weekNumber) {
    const weeks = this.loadWeeks();
    const index = weeks.indexOf(weekNumber);
    if (index > -1) {
      weeks.splice(index, 1);
      
      // Renumber all weeks after the deleted one to fill the gap
      for (let i = index; i < weeks.length; i++) {
        weeks[i] = i + 1;
      }
      
      LocalStorageManager.save('weekList', weeks);
      
      // Update display
      this.updateWeekDisplay();
      
      // Show success notification
      try {
        Notify && Notify.success(`Week ${weekNumber} deleted and weeks renumbered!`);
      } catch(e) {}
      
      return true;
    }
    return false;
  }

  static updateWeekDisplay() {
    const totalWeeks = this.getTotalWeeks();
    const currentWeek = DateManager.getCurrentWeek();
    
    // Update all week displays on the page
    document.querySelectorAll('.week-display, p').forEach(p => {
      if (p.textContent && p.textContent.includes('Week') && p.textContent.includes('/')) {
        p.textContent = `Week ${currentWeek}/${totalWeeks}`;
      }
    });
  }

  static showWeekModal() {
    const weeks = this.loadWeeks();
    const totalWeeks = weeks.length;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'weekManagerModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Manage Weeks</h2>
          <span class="close-btn">&times;</span>
        </div>
        
        <div class="total-weeks-display">
          <span class="total-weeks-label">Total Weeks:</span>
          <span class="total-weeks-number">${totalWeeks}</span>
        </div>
        
        <div class="week-list">
          ${weeks.map(week => `
            <div class="week-item">
              <span class="week-number">Week ${week}</span>
              <button class="delete-week-btn" data-week="${week}">Delete</button>
            </div>
          `).join('')}
        </div>
        
        <div class="modal-actions">
          <button class="save-btn add-week-btn">Add Week</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Event listeners
    const addBtn = modal.querySelector('.add-week-btn');
    const closeBtn = modal.querySelector('.close-btn');
    
    addBtn.addEventListener('click', () => {
      this.addWeek();
      // Don't close modal - keep it open for adding more weeks
      // Refresh the modal content to show the new week
      this.refreshModalContent(modal);
    });
    
    closeBtn.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
         // Delete week buttons
     modal.querySelectorAll('.delete-week-btn').forEach(btn => {
       btn.addEventListener('click', (e) => {
         const weekNumber = parseInt(e.target.dataset.week);
         if (this.deleteWeek(weekNumber)) {
           // Don't close modal - refresh content to show renumbered weeks
           this.refreshModalContent(modal);
         }
       });
     });
    
    // Remove outside click close - only close with X button
  }

  static closeModal(modal) {
    modal.style.display = 'none';
    modal.remove();
  }

  static refreshModalContent(modal) {
    const weeks = this.loadWeeks();
    const totalWeeks = weeks.length;
    
    // Update the total weeks display
    const totalWeeksNumber = modal.querySelector('.total-weeks-number');
    if (totalWeeksNumber) {
      totalWeeksNumber.textContent = totalWeeks;
    }
    
    // Update the week list
    const weekList = modal.querySelector('.week-list');
    if (weekList) {
      weekList.innerHTML = weeks.map(week => `
        <div class="week-item">
          <span class="week-number">Week ${week}</span>
          <button class="delete-week-btn" data-week="${week}">Delete</button>
        </div>
      `).join('');
      
             // Re-attach delete event listeners to new buttons
       weekList.querySelectorAll('.delete-week-btn').forEach(btn => {
         btn.addEventListener('click', (e) => {
           const weekNumber = parseInt(e.target.dataset.week);
           if (this.deleteWeek(weekNumber)) {
             // Don't close modal - refresh content to show renumbered weeks
             this.refreshModalContent(modal);
           }
         });
       });
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  WeekManager.init();
});

// Make it globally available
window.WeekManager = WeekManager;
