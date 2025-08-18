class HourTracker {
  static init() {
    const h1 = document.querySelector('.hourcard h1');
    const today = new Date(); today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];
    const hoursDate = localStorage.getItem('hoursDate');

    // Reset hours if the saved date is not today
    if (hoursDate !== todayStr) {
      localStorage.setItem('studyHours', '0');
      localStorage.setItem('hoursDate', todayStr);
    }

    const hours = parseInt(localStorage.getItem('studyHours')) || 0;
    if (h1) h1.textContent = hours;

    document.getElementById('addHourBtn')?.addEventListener('click', () => {
      // Ensure we are still on the same day; if not, reset first
      const now = new Date(); now.setHours(0,0,0,0);
      const nowStr = now.toISOString().split('T')[0];
      const currentSavedDate = localStorage.getItem('hoursDate');
      if (currentSavedDate !== nowStr) {
        localStorage.setItem('studyHours', '0');
        localStorage.setItem('hoursDate', nowStr);
        if (h1) h1.textContent = '0';
      }

      const curr = parseInt(localStorage.getItem('studyHours')) || 0;
      localStorage.setItem('studyHours', String(curr + 1));
      if (h1) h1.textContent = String(curr + 1);
      StreakCounter.recordStudySession();
    });

    // Schedule automatic midnight reset for hours (and streak check)
    this.scheduleMidnightReset(h1);
  }

  static scheduleMidnightReset(h1El) {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24,0,0,0);
    const delay = nextMidnight.getTime() - now.getTime();

    setTimeout(() => {
      const today = new Date(); today.setHours(0,0,0,0);
      const todayStr = today.toISOString().split('T')[0];
      localStorage.setItem('studyHours', '0');
      localStorage.setItem('hoursDate', todayStr);
      if (h1El) h1El.textContent = '0';

      // Notify streak system that a day has rolled over
      if (typeof StreakCounter?.handleMidnightTick === 'function') {
        StreakCounter.handleMidnightTick();
      }

      // Refresh date/week UI at midnight
      if (typeof DateManager?.refresh === 'function') {
        DateManager.refresh();
      } else if (typeof DateManager?.init === 'function') {
        DateManager.init();
      }

      // Reschedule for the next midnight
      this.scheduleMidnightReset(h1El);
    }, delay);
  }
}
document.addEventListener('DOMContentLoaded', () => HourTracker.init());
