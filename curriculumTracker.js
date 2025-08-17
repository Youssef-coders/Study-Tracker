
class CurriculumTracker {
  static subjectName(){ return (document.querySelector('.subtitle')?.textContent || 'General').trim(); }
  static ensureContainers(){
    this.curricCard = document.querySelector('.curric-card') || document.body;
  }
  static bindForms(){
    const lessonForm = document.querySelector('#lessonModal .lesson-form');
    if (lessonForm && !lessonForm.dataset.bound){
      lessonForm.dataset.bound = '1';
      lessonForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const inputs = lessonForm.querySelectorAll('input[type="text"]');
        const num = inputs[0]?.value.trim();
        const title = inputs[1]?.value.trim();
        const part = inputs[2]?.value.trim();
        if (!num || !title){ alert('Please enter lesson number and title'); return; }
        const id = `L${num.replace(/\s+/g,'_')}`;
        const sub = this.subjectName();
        // Persist minimal structure
        const key = `curriculum_${sub}`;
        const data = LocalStorageManager.load(key) || { chapters: {} };
        const chapKey = num.split('.')[0];
        if (!data.chapters[chapKey]) data.chapters[chapKey] = { lessons: [] };
        data.chapters[chapKey].lessons.push({ id, num, title, part });
        LocalStorageManager.save(key, data);
        // Add to UI (generic append)
        this.ensureContainers();
        const lessonEl = document.createElement('div');
        lessonEl.className = 'lesson';
        lessonEl.id = id;
        lessonEl.innerHTML = `<div class="button-group"><button>-</button><h3>0%</h3><button>+</button></div><h3>${num} ${title}${part?(' - '+part):''}</h3><div class="checkbox"><input type="checkbox" class="topic-checkbox" id="${id}"></div>`;
        this.curricCard.appendChild(lessonEl);
        // Close
        lessonForm.reset();
        document.getElementById('lessonModal').style.display='none';
      });
    }
    const chapterForm = document.querySelector('#chapterModal .chapter-form');
    if (chapterForm && !chapterForm.dataset.bound){
      chapterForm.dataset.bound = '1';
      chapterForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        const inputs = chapterForm.querySelectorAll('input[type="text"]');
        const num = inputs[0]?.value.trim();
        const title = inputs[1]?.value.trim();
        if (!num || !title){ alert('Please enter chapter number and title'); return; }
        const sub = this.subjectName();
        const key = `curriculum_${sub}`;
        const data = LocalStorageManager.load(key) || { chapters: {} };
        if (!data.chapters[num]) data.chapters[num] = { lessons: [], title };
        else data.chapters[num].title = title;
        LocalStorageManager.save(key, data);
        // Add to UI
        this.ensureContainers();
        const h = document.createElement('h3'); h.textContent = `CHAPTER ${num}: ${title}`;
        this.curricCard.appendChild(h);
        chapterForm.reset();
        document.getElementById('chapterModal').style.display='none';
      });
    }
  }

  static init() {
    this.loadProgress();
    document.querySelector('.addchapter')?.addEventListener('click', ()=> document.getElementById('chapterModal').style.display = 'block');
    document.querySelector('.addlesson')?.addEventListener('click', ()=> document.getElementById('lessonModal').style.display = 'block');
    document.querySelectorAll('#chapterModal .close-btn, #lessonModal .close-btn').forEach(b => b.addEventListener('click', ()=> { b.closest('.modal').style.display = 'none'; 
    this.bindForms();
  }));
    window.addEventListener('click', e => {
      if (e.target.id === 'chapterModal') document.getElementById('chapterModal').style.display = 'none';
      if (e.target.id === 'lessonModal') document.getElementById('lessonModal').style.display = 'none';
    });
  }

  static loadProgress() {
    const p = LocalStorageManager.getProgress();
    const subject = document.querySelector('.subtitle')?.textContent?.trim() || 'General';
    const sdata = p[subject] || {};
    Object.keys(sdata).forEach(lessonId => {
      const el = document.getElementById(lessonId);
      if (el) {
        const val = sdata[lessonId];
        const h3 = el.querySelector('.button-group h3');
        if (h3) h3.textContent = `${val}%`;
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', ()=>CurriculumTracker.init());
