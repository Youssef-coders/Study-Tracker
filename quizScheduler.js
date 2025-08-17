class QuizScheduleModal {
  static renderGrid(schedule) {
    const tbody = document.getElementById('qs-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    // Only render grid if start and end weeks are selected
    if (!schedule.startWeek || !schedule.endWeek) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #666;">Please select start and end weeks first</td></tr>';
      return;
    }
    
    for (let w = schedule.startWeek; w <= schedule.endWeek; w++) {
      const tr = document.createElement('tr');
      const th = document.createElement('th'); th.textContent = `Week ${w}`; tr.appendChild(th);
      ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY'].forEach(d => {
        const td = document.createElement('td');
        const sel = document.createElement('select');
        const key = `week${w}_${d}`;
        const val = schedule.quizzes[key] || '';
        ['','Mathematics','Physics','Chemistry','English','Biology','Arabic','Business'].forEach(opt => {
          const o = document.createElement('option'); o.value = opt; o.textContent = opt || '—';
          if (opt === val) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener('change', ()=> {
          if (sel.value) schedule.quizzes[key]=sel.value; else delete schedule.quizzes[key];
        });
        td.appendChild(sel); tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
  }

  static show(schedule) {
    const modal = document.getElementById('quizSeasonModal');
    if (!modal) return;
    
    // Set current values
    document.getElementById('qs-start').value = schedule.startWeek || '';
    document.getElementById('qs-end').value = schedule.endWeek || '';
    
    // Render initial grid
    this.renderGrid(schedule);
    
    // Show modal
    modal.style.display = 'block';
    
    // Add event listeners for week changes
    document.getElementById('qs-start').addEventListener('change', () => {
      schedule.startWeek = parseInt(document.getElementById('qs-start').value) || null;
      this.renderGrid(schedule);
    });
    
    document.getElementById('qs-end').addEventListener('change', () => {
      schedule.endWeek = parseInt(document.getElementById('qs-end').value) || null;
      this.renderGrid(schedule);
    });
    
    // Close button
    modal.querySelector('.close-btn')?.addEventListener('click', ()=>modal.style.display='none');
    
    // Cancel button
    document.getElementById('qs-cancel')?.addEventListener('click', ()=>modal.style.display='none');
    
    // Save button
    document.getElementById('qs-save')?.addEventListener('click', ()=>{
      const start = Math.max(1,Math.min(11,parseInt(document.getElementById('qs-start').value||1)));
      const end = Math.max(start,Math.min(11,parseInt(document.getElementById('qs-end').value||11)));
      schedule.startWeek = start; 
      schedule.endWeek = end;
      QuizScheduler.saveSchedule(schedule);
      modal.style.display = 'none';
      alert('Quiz schedule saved successfully!');
    }, { once: true });
  }
}

class QuizScheduler {
  static init() {
    this.schedule = LocalStorageManager.getQuizSchedule() || { startWeek:1, endWeek:11, quizzes:{} };
    document.querySelector('.set')?.addEventListener('click', ()=> QuizScheduleModal.show(this.schedule));
  }
  static saveSchedule(schedule) { this.schedule = schedule; LocalStorageManager.saveQuizSchedule(schedule); }
  static getQuizForDate(date) {
    const week = DateManager.getCurrentWeek();
    const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    if (week >= this.schedule.startWeek && week <= this.schedule.endWeek) {
      return this.schedule.quizzes[`week${week}_${day}`] || null;
    }
    return null;
  }
}
document.addEventListener('DOMContentLoaded', ()=>QuizScheduler.init());
