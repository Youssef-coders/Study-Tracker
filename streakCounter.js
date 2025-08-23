class StreakCounter {
  static dateKey(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  static init() {
    if (!document.querySelector('.streakcard')) return;
    this.streak = parseInt(localStorage.getItem('streak')) || 0;
    this.last = localStorage.getItem('lastStudyDate') || null;
    // If app was closed over missed days, ensure reset-on-load (but allow weekend gaps)
    const now = new Date(); now.setHours(0,0,0,0);
    const todayStr = this.dateKey(now);
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = this.dateKey(yesterday);
    
    if (this.last && this.last !== todayStr && this.last !== yStr) {
      // Check if the gap is just a weekend (Thursday to Sunday = 3 days)
      const lastDate = new Date(this.last);
      const daysDiff = Math.round((now - lastDate) / (1000*60*60*24));
      
      if (daysDiff === 3) {
        // Check if it's a valid weekend gap
        const lastDay = lastDate.getDay(); // 3=Wednesday, 4=Thursday
        const todayDay = now.getDay(); // 0=Sunday, 6=Saturday
        
        // Valid gaps: Wednesday to Sunday, Thursday to Sunday, Thursday to Saturday
        if ((lastDay === 3 && todayDay === 0) || // Wed to Sun
            (lastDay === 4 && todayDay === 0) || // Thu to Sun  
            (lastDay === 4 && todayDay === 6)) { // Thu to Sat
          // This is a valid weekend gap, don't reset
        } else {
          // Not a weekend gap, reset streak
          this.streak = 0;
          localStorage.setItem('streak', '0');
        }
      } else if (daysDiff > 3) {
        // Gap is more than weekend, reset streak
        this.streak = 0;
        localStorage.setItem('streak', '0');
      }
      // If daysDiff is 1 or 2, it's consecutive or just one day gap, don't reset
    }
    this.updateDisplay();
  }

  static recordStudySession() {
    const now = new Date(); now.setHours(0,0,0,0);
    const todayStr = this.dateKey(now);
    if (this.last === todayStr) return; // already recorded today
    const before = this.streak;
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
    if (this.streak !== before) {
      try { const n = document.querySelector('.streakcard h1'); n?.classList.add('streak-pop'); setTimeout(()=>n?.classList.remove('streak-pop'), 320); } catch(e){}
    }
  }

  static isConsecutiveDay(last) {
    if (!last) return false;
    const ld = new Date(last); ld.setHours(0,0,0,0);
    const now = new Date(); now.setHours(0,0,0,0);
    const diff = Math.round((now - ld) / (1000*60*60*24));
    
    // For Sunday-Thursday week structure, allow gaps on weekends
    if (diff === 1) return true; // Consecutive day
    
    // Check if the gap includes only weekend days (Wednesday to Sunday = 3 days)
    if (diff === 3) {
      const lastDay = ld.getDay(); // 3=Wednesday, 4=Thursday
      const currentDay = now.getDay(); // 0=Sunday, 6=Saturday
      
      // If last study was Wednesday and current is Sunday, that's allowed (Thursday/Friday are weekend)
      if (lastDay === 3 && currentDay === 0) return true;
      // If last study was Thursday and current is Sunday, that's allowed (Friday/Saturday are weekend)
      if (lastDay === 4 && currentDay === 0) return true;
      // If last study was Thursday and current is Saturday, that's allowed (Friday is weekend)
      if (lastDay === 4 && currentDay === 6) return true;
    }
    
    // Check if the gap is Wednesday to Monday (5 days) - this should continue streak
    if (diff === 5) {
      const lastDay = ld.getDay(); // 3=Wednesday
      const currentDay = now.getDay(); // 1=Monday
      
      // If last study was Wednesday and current is Monday, this continues streak (Thursday/Friday are weekend)
      if (lastDay === 3 && currentDay === 1) return true;
    }
    
    return false;
  }

  // Called at midnight to reset streak if the user did not study today
  static handleMidnightTick() {
    const now = new Date(); now.setHours(0,0,0,0);
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    const yStr = this.dateKey(yesterday);
    const last = localStorage.getItem('lastStudyDate');
    if (!last) {
      // No history; ensure display is zeroed
      this.streak = 0;
      localStorage.setItem('streak', '0');
      this.updateDisplay();
      return;
    }
    
    // Check if yesterday was a weekend day (Thursday or Friday)
    const yesterdayDay = yesterday.getDay(); // 4=Thursday, 5=Friday
    const isWeekend = yesterdayDay === 4 || yesterdayDay === 5; // Thursday and Friday are weekend
    
    if (last !== yStr && !isWeekend) {
      // If the last recorded day is not yesterday AND yesterday wasn't a weekend, then reset
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
