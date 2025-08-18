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
  static getCurrentWeek(){ return this.getTermWeek(new Date()); }
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
      weekLabel = `Week ${week}/11`;
      termLabel = `Term ${term}`;
    }
    if (di) {
      di.innerHTML = `<p>${termLabel}</p><p>${weekLabel}</p><p>${months[now.getMonth()]}</p><p>${now.getDate()}</p>`;
    }
  }
  static refresh(){ this.init(); }
}
document.addEventListener('DOMContentLoaded', ()=>DateManager.init());
