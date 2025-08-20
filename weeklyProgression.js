class WeeklyProgression {
  static init() {
    console.log('WeeklyProgression initializing...');
    
    // Check if it's Friday and if we need to show the modal
    this.checkWeeklyProgression();
    
    // Set up a daily check (in case the site is opened on Friday)
    this.setupDailyCheck();
  }

  static setupDailyCheck() {
    // Check every day at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
      this.checkWeeklyProgression();
      // Then check every 24 hours
      setInterval(() => this.checkWeeklyProgression(), 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  static checkWeeklyProgression() {
    const today = new Date();
    const isThursday = today.getDay() === 4; // 4 = Thursday (end of your week)
    
    if (!isThursday) return;
    
    const currentWeek = this.getCurrentWeek();
    const lastPromptedWeek = this.getLastPromptedWeek();
    
    // Only show modal if we haven't prompted for this week yet
    if (currentWeek !== lastPromptedWeek) {
      this.showWeeklyProgressionModal(currentWeek);
    }
  }

  static getCurrentWeek() {
    const termStart = LocalStorageManager.getTermStart();
    if (!termStart) return 1;
    
    const startDate = new Date(termStart);
    const today = new Date();
    
    // Adjust for Sunday-Thursday week structure
    // If today is Friday or Saturday, count as end of previous week
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      today.setDate(today.getDate() - (dayOfWeek === 5 ? 1 : 2)); // Go back to Thursday
    }
    
    const weeksDiff = Math.floor((today - startDate) / (7 * 24 * 60 * 60 * 1000));
    
    const totalWeeks = WeekManager ? WeekManager.getTotalWeeks() : 11;
    return Math.min(weeksDiff + 1, totalWeeks); // Cap at total weeks
  }

  static getLastPromptedWeek() {
    return LocalStorageManager.load('lastPromptedWeek') || 0;
  }

  static setLastPromptedWeek(week) {
    LocalStorageManager.save('lastPromptedWeek', week);
  }

  static getCurrentWeekNumber() {
    return LocalStorageManager.load('currentWeekNumber') || 1;
  }

  static setCurrentWeekNumber(week) {
    LocalStorageManager.save('currentWeekNumber', week);
  }

  static showWeeklyProgressionModal(weekNumber) {
    // Don't show modal if week 11 has already ended
    if (weekNumber > 11) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'weeklyProgressionModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Week ${weekNumber} Has Ended</h2>
        <p>Would you like Week ${weekNumber + 1} to start next week (Sunday), or skip this week?</p>
        <p><small>Use skip if there's a holiday or break next week. Week ${weekNumber} will continue until you start the next week.</small></p>
        
        <div class="modal-actions">
          <button class="save-btn start-week-btn">Start Week ${weekNumber + 1}</button>
          <button class="cancel-btn skip-week-btn">Skip Week</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Event listeners
    const startBtn = modal.querySelector('.start-week-btn');
    const skipBtn = modal.querySelector('.skip-week-btn');
    
    startBtn.addEventListener('click', () => {
      this.startNextWeek(weekNumber);
      this.closeModal(modal);
    });
    
    skipBtn.addEventListener('click', () => {
      this.skipWeek(weekNumber);
      this.closeModal(modal);
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
    
    // Mark this week as prompted
    this.setLastPromptedWeek(weekNumber);
  }

  static startNextWeek(weekNumber) {
    const nextWeek = weekNumber + 1;
    this.setCurrentWeekNumber(nextWeek);
    
    // Update the day info display
    this.updateWeekDisplay(nextWeek);
    
    try { 
      Notify && Notify.success(`Week ${nextWeek} started!`); 
    } catch(e) {}
    
    console.log(`Week ${nextWeek} started`);
  }

  static skipWeek(weekNumber) {
    // Keep the same week number, but mark this week as prompted
    try { 
      Notify && Notify.info(`Week ${weekNumber} skipped. Will ask again next Thursday.`); 
    } catch(e) {}
    
    console.log(`Week ${weekNumber} skipped`);
  }

  static updateWeekDisplay(weekNumber) {
    const totalWeeks = WeekManager ? WeekManager.getTotalWeeks() : 11;
    
    // Update the week display in the day info
    const weekElements = document.querySelectorAll('#day-info p');
    
    weekElements.forEach(el => {
      if (el.textContent.includes('Week') || el.textContent.includes('week')) {
        el.textContent = `Week ${weekNumber}/${totalWeeks}`;
      }
    });
    
    // Also update any other week displays
    document.querySelectorAll('.week-display').forEach(el => {
      el.textContent = `Week ${weekNumber}/${totalWeeks}`;
    });
  }

  static closeModal(modal) {
    modal.style.display = 'none';
    modal.remove();
  }

  // Method to manually trigger the modal (for testing)
  static testModal() {
    const currentWeek = this.getCurrentWeek();
    this.showWeeklyProgressionModal(currentWeek);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing WeeklyProgression...');
  WeeklyProgression.init();
});

// Make it globally available
window.WeeklyProgression = WeeklyProgression;
