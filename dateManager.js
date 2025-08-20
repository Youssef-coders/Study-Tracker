class DateManager {
  static getTermWeek(now=new Date()){
    const termActive = LocalStorageManager.isTermActive();
    const startIso = LocalStorageManager.getTermStart();
    if (!termActive || !startIso) return 0;
    const start = new Date(startIso); start.setHours(0,0,0,0);
    const t = new Date(now); t.setHours(0,0,0,0);
    const diff = t - start;
    const week = Math.floor(diff/(7*24*3600*1000)) + 1;
    if (week < 1) return 1;
    if (week > 11) return 11;
    return week;
  }
  static getCurrentWeek(){ 
    // Check if we have a manually set week number from weekly progression
    let manualWeek = null;
    try {
      if (typeof WeeklyProgression !== 'undefined' && WeeklyProgression.getCurrentWeekNumber) {
        manualWeek = WeeklyProgression.getCurrentWeekNumber();
      }
    } catch (e) {
      console.log('WeeklyProgression not available yet:', e);
    }
    
    if (manualWeek) return manualWeek;
    
    // Otherwise calculate from term start
    return this.getTermWeek(new Date()); 
  }
  static init(){
    const now = new Date();
    const dayNames = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dayBox = document.querySelector('h1.day'); if (dayBox) dayBox.textContent = dayNames[now.getDay()];
    const di = document.getElementById('day-info');
    const termActive = LocalStorageManager.isTermActive();
    const term = Number(LocalStorageManager.getTerm() || 0);
    let weekLabel = 'Week 0/11', termLabel = 'Term 0';
    if (termActive && LocalStorageManager.getTermStart()) {
      const week = this.getCurrentWeek();
      // Safely check for WeekManager
      let totalWeeks = 11; // Default fallback
      try {
        if (typeof WeekManager !== 'undefined' && WeekManager.getTotalWeeks) {
          totalWeeks = WeekManager.getTotalWeeks();
        }
      } catch (e) {
        console.log('WeekManager not available yet, using default:', e);
      }
      weekLabel = `Week ${week}/${totalWeeks}`;
      termLabel = `Term ${term}`;
    }
    if (di) {
      // Update only the text content, preserve the button structure
      const termP = di.querySelector('p:first-child');
      const weekButton = di.querySelector('.week-display');
      const monthP = di.querySelector('p:nth-child(3)');
      const dayP = di.querySelector('p:last-child');
      
      if (termP) termP.textContent = termLabel;
      if (weekButton) weekButton.textContent = weekLabel;
      if (monthP) monthP.textContent = months[now.getMonth()];
      if (dayP) dayP.textContent = now.getDate();
      
      console.log('Day info updated while preserving week-display button');
    }
  }
  static refresh(){ this.init(); }
}
document.addEventListener('DOMContentLoaded', ()=>DateManager.init());
