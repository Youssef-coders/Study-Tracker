class LocalStorageManager {
  static save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) { console.error(e); }
  }
  static load(key) {
    try {
      const d = localStorage.getItem(key);
      return d ? JSON.parse(d) : null;
    } catch(e) { console.error(e); return null; }
  }
  static remove(key) {
    try { localStorage.removeItem(key); } catch(e) { console.error(e); }
  }
  static clearTermData() {
    // Remove runtime term data, keep global prefs
    const keys = ['assignments','progress','resources','studyHours','streak','lastStudyDate','quizSchedule'];
    keys.forEach(k => { try { localStorage.removeItem(k); } catch(e){} });
  }

  // Assignments
  static getAssignments(){ return this.load('assignments') || []; }
  static saveAssignments(arr){ this.save('assignments', arr || []); }
  static addAssignment(a){ const arr = this.getAssignments(); arr.push(a); this.save('assignments', arr); return arr; }

  // Resources (by chapter)
  static getResources(){ return this.load('resources') || {}; }
  static saveResources(obj){ this.save('resources', obj || {}); }

  // Progress per subject -> lessonId -> percentage
  static getProgress(){ return this.load('progress') || {}; }
  static saveProgress(subject, lessonId, percentage){
    const p = this.getProgress();
    if (!p[subject]) p[subject] = {};
    p[subject][lessonId] = percentage;
    this.save('progress', p);
  }

  // Quiz schedule
  static getQuizSchedule(){ return this.load('quizSchedule') || { startWeek:1, endWeek:11, quizzes:{} }; }
  static saveQuizSchedule(s){ this.save('quizSchedule', s); }

  // Term state
  static getTerm(){ return this.load('term') ?? 0; }
  static setTerm(n){ this.save('term', Number(n)); }
  static isTermActive(){ return !!this.load('termActive'); }
  static setTermActive(b){ this.save('termActive', !!b); }
  static getTermStart(){ return this.load('termStart'); }
  static setTermStart(iso){ if (!iso) this.remove('termStart'); else this.save('termStart', iso); }
}
