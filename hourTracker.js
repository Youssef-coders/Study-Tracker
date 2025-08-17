class HourTracker {
  static init() {
    const hours = parseInt(localStorage.getItem('studyHours')) || 0;
    const h1 = document.querySelector('.hourcard h1');
    if (h1) h1.textContent = hours;
    document.getElementById('addHourBtn')?.addEventListener('click', () => {
      const curr = parseInt(localStorage.getItem('studyHours')) || 0;
      localStorage.setItem('studyHours', String(curr + 1));
      if (h1) h1.textContent = curr + 1;
      StreakCounter.recordStudySession();
    });
  }
}
document.addEventListener('DOMContentLoaded', () => HourTracker.init());
