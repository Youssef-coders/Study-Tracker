class StreakCounter {
  static init() {
    if (!document.querySelector('.streakcard')) return;
    this.streak = parseInt(localStorage.getItem('streak')) || 0;
    this.last = localStorage.getItem('lastStudyDate') || null;
    // If app was closed over missed days, ensure reset-on-load
    const now = new Date(); now.setHours(0,0,0,0);
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    if (this.last && this.last !== todayStr && this.last !== yStr) {
      this.streak = 0;
      localStorage.setItem('streak', '0');
    }
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
    // update highest streak
    try {
      const hs = parseInt(localStorage.getItem('highestStreak')) || 0;
      const beat = this.streak > hs;
      if (beat) localStorage.setItem('highestStreak', String(this.streak));
      const el = document.getElementById('highestStreak');
      if (el) {
        el.textContent = String(beat ? this.streak : hs);
        if (beat) { el.classList.add('glow'); setTimeout(()=> el.classList.remove('glow'), 1000); }
      }
    } catch(e){}
    this.updateDisplay();
    try { document.querySelector('.streakcard h1')?.classList.add('streak-pop'); setTimeout(()=>document.querySelector('.streakcard h1')?.classList.remove('streak-pop'), 320); } catch(e){}
  }

  static isConsecutiveDay(last) {
    if (!last) return false;
    const ld = new Date(last); ld.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.round((now - ld) / (1000*60*60*24));
    return diff === 1;
  }

  // Called at midnight to reset streak if the user did not study today
  static handleMidnightTick() {
    const now = new Date(); now.setHours(0,0,0,0);
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    const last = localStorage.getItem('lastStudyDate');
    if (!last) {
      // No history; ensure display is zeroed
      this.streak = 0;
      localStorage.setItem('streak', '0');
      this.updateDisplay();
      return;
    }
    if (last !== yStr) {
      // If the last recorded day is not yesterday, then the last day had no study → reset
      this.streak = 0;
      localStorage.setItem('streak', '0');
      // Do not update lastStudyDate here; it should only reflect study days
      this.updateDisplay();
    }
  }

  static updateDisplay() {
    const el = document.querySelector('.streakcard h1');
    if (el) el.textContent = String(this.streak);
  }
}
document.addEventListener('DOMContentLoaded', () => StreakCounter.init());
