class StreakCounter {
  static init() {
    if (!document.querySelector('.streakcard')) return;
    this.streak = parseInt(localStorage.getItem('streak')) || 0;
    this.last = localStorage.getItem('lastStudyDate') || null;
    this.updateDisplay();
  }

  static recordStudySession() {
    const now = new Date(); now.setHours(0,0,0,0);
    const todayStr = now.toISOString().split('T')[0];
    if (this.last === todayStr) return; // already recorded today
    if (this.isConsecutiveDay(this.last)) this.streak++;
    else this.streak = 1;
    this.last = todayStr;
    localStorage.setItem('streak', String(this.streak));
    localStorage.setItem('lastStudyDate', this.last);
    this.updateDisplay();
  }

  static isConsecutiveDay(last) {
    if (!last) return false;
    const ld = new Date(last); ld.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.round((now - ld) / (1000*60*60*24));
    return diff === 1;
  }

  static updateDisplay() {
    const el = document.querySelector('.streakcard h1');
    if (el) el.textContent = String(this.streak);
  }
}
document.addEventListener('DOMContentLoaded', () => StreakCounter.init());
