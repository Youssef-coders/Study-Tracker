class AssignmentModal {
  static show() {
    const m = document.getElementById('assignmentModal');
    if (m) { m.style.display = 'block'; document.querySelector('.assignment-form')?.reset(); }
  }
  static hide() {
    const m = document.getElementById('assignmentModal'); if (m) m.style.display = 'none';
  }
  static init() {
    document.querySelector('#assignmentModal .close-btn')?.addEventListener('click', ()=>this.hide());
    document.querySelector('.assignment-form')?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const form = e.target;
      const name = form.querySelector('input[type="text"]').value.trim();
      const selects = form.querySelectorAll('select');
      const subject = selects[0].value;
      const dueDate = form.querySelector('input[type="date"]').value;
      const status = selects[1].value;
      AssignmentManager.addAssignment(name, subject, dueDate, status);
      this.hide();
    });
    document.querySelector('.cancel-btn')?.addEventListener('click', ()=>this.hide());
    window.addEventListener('click', e => { if (e.target === document.getElementById('assignmentModal')) this.hide(); });
  }
}
document.addEventListener('DOMContentLoaded', ()=>AssignmentModal.init());
