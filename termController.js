class TermController {
  constructor() {
    this.term = Number(LocalStorageManager.getTerm() || 0);
    // Set initial body class
    document.body.className = `term-${this.term}`;
    this.applyTheme();
    document.querySelector('.term-start')?.classList.add('btn','btn-start');
    document.querySelector('.term-end')?.classList.add('btn','btn-end');
    document.querySelector('.term-start')?.addEventListener('click', ()=> this.startTerm());
    document.querySelector('.term-end')?.addEventListener('click', ()=> {
      if (confirm('End the current term and archive data?')) this.endTerm();
    });
  }
  applyTheme() {
    const active = LocalStorageManager.isTermActive();
    const term = Number(LocalStorageManager.getTerm() || 0);
    const pre = { color:'#888', dark:'#263238' };
    const t1  = { color:'#0b3d91', dark:'#0b3d91' };
    const t2  = { color:'#0b7a3b', dark:'#0b7a3b' };
    const theme = !active ? pre : (term===1 ? t1 : t2);

    // Set body class for term-based styling
    document.body.className = `term-${term}`;
    if (!active) document.body.classList.add('pre-term');

    document.documentElement.style.setProperty('--term-color', theme.color);
    ['header','.headerspacer','.sidewallleft','.sidewallright'].forEach(sel=>{
      document.querySelectorAll(sel).forEach(el=> { el.style.backgroundColor = theme.dark; });
    });
    
    // Apply styling to cards but not navbar elements
    document.querySelectorAll('.hourcard, .streakcard, .widecard, .curric-card, .res-card, .setting').forEach(el=>{
      el.style.backgroundColor = '#fff';
      el.style.border = `2px solid ${theme.color}`;
      el.style.borderRadius = '12px';
    });
    
    // For navbar elements, let CSS handle the background colors
    document.querySelectorAll('.navbar .term-element').forEach(el => {
      el.style.border = `2px solid ${theme.color}`;
      el.style.borderRadius = '12px';
    });
  }
  startTerm() {
    let term = Number(LocalStorageManager.getTerm() || 0);
    term = (term===0 || term===2) ? 1 : 2;
    LocalStorageManager.setTerm(term);
    LocalStorageManager.setTermActive(true);
    LocalStorageManager.setTermStart(new Date().toISOString().slice(0,10));
    this.applyTheme();
    DateManager.init();
    alert(`Term ${term} started.`);
  }
  endTerm() {
    const archive = {
      term: LocalStorageManager.getTerm(),
      endedAt: new Date().toISOString(),
      assignments: LocalStorageManager.getAssignments(),
      progress: LocalStorageManager.getProgress(),
      resources: LocalStorageManager.getResources(),
      studyHours: LocalStorageManager.getStudyHours(),
      streak: LocalStorageManager.getStreak(),
      quizSchedule: LocalStorageManager.getQuizSchedule()
    };
    const blob = new Blob([JSON.stringify(archive, null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'term-archive.json';
    document.body.appendChild(a); a.click(); a.remove();
    LocalStorageManager.clearTermData();
    LocalStorageManager.setTermActive(false);
    LocalStorageManager.setTerm(0);
    LocalStorageManager.setTermStart(null);
    this.applyTheme();
    DateManager.init();
    alert('Term ended. Pre-term mode activated.');
  }
}
document.addEventListener('DOMContentLoaded', ()=>{ window.TermController = new TermController(); });
