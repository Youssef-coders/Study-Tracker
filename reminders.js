// In-app reminders for study streak and due assignments
(function(){
  function dateKey(d){
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), da=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${da}`;
  }
  function getAssignments(){
    try{
      if (window.LocalStorageManager && LocalStorageManager.load) return LocalStorageManager.load('assignments') || [];
      const raw = localStorage.getItem('assignments');
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function getLastStudy(){ try { return localStorage.getItem('lastStudyDate'); } catch(e){ return null; } }

  function remindStudy(){
    const now = new Date();
    const today = dateKey(new Date(now.setHours(0,0,0,0)));
    const last = getLastStudy();
    // Only after 20:00 local time and only once per day
    if (new Date().getHours() < 20) return;
    const flagKey = `remind_study_${today}`;
    if (localStorage.getItem(flagKey) === '1') return;
    if (last !== today){
      try { window.Notify && Notify.warn('No study logged today – keep your streak alive!'); } catch(e){}
      localStorage.setItem(flagKey, '1');
    }
  }

  function remindAssignments(){
    const now = new Date(); now.setHours(0,0,0,0);
    const today = dateKey(now);
    const tomorrow = dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate()+1));
    const flagKey = `remind_due_${today}`;
    if (localStorage.getItem(flagKey) === '1') return;
    const assignments = getAssignments().filter(a=>a && a.dueDate && a.status !== 'Completed');
    const dueToday = assignments.filter(a=>a.dueDate === today);
    const dueTomorrow = assignments.filter(a=>a.dueDate === tomorrow);
    if (dueToday.length || dueTomorrow.length){
      const parts = [];
      if (dueToday.length) parts.push(`${dueToday.length} due today`);
      if (dueTomorrow.length) parts.push(`${dueTomorrow.length} due tomorrow`);
      try { window.Notify && Notify.info(`Assignments: ${parts.join(' • ')}`); } catch(e){}
      localStorage.setItem(flagKey, '1');
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    try { remindStudy(); remindAssignments(); } catch(e){}
    // Optional: refresh checks at 8pm boundary without reloading
    const msToNextMinute = 60000 - (Date.now() % 60000);
    setTimeout(()=>{
      setInterval(()=>{ try { remindStudy(); remindAssignments(); } catch(e){} }, 60000);
    }, msToNextMinute);
  });
})();


