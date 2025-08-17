class AssignmentManager {
  static init() {
    this.assignments = LocalStorageManager.getAssignments() || [];
    this.renderAllAssignments();
    document.querySelector('.addlesson')?.addEventListener('click', () => AssignmentModal.show());
  }

  static addAssignment(name, subject, dueDate, status) {
    const one = { id: Date.now(), name, subject, dueDate, status };
    this.assignments.push(one);
    LocalStorageManager.save('assignments', this.assignments);
    this.renderAllAssignments();
    AssignmentLoader.loadUpcomingAssignments();
  }

  static renderAllAssignments() {
    const container = document.querySelector('.curric-card');
    if (!container) return;
    // remove old .upassign nodes
    container.querySelectorAll('.upassign').forEach(n => n.remove());
    this.assignments.forEach(a => {
      const due = new Date(a.dueDate); due.setHours(0,0,0,0);
      const today = new Date(); today.setHours(0,0,0,0);
      const diff = Math.round((due - today)/(1000*60*60*24));
      const dueText = diff < 0 ? `Overdue by ${Math.abs(diff)} days` : (diff===0 ? 'Due Today' : `Due in ${diff} ${diff===1?'Day':'Days'}`);
      const el = document.createElement('div');
      el.className = 'upassign';
      el.innerHTML = `<h4>${a.name}</h4><h4>${a.subject}</h4><h4>${dueText}</h4><h4>${a.status}</h4>`;
      container.appendChild(el);
    });
  }
}
document.addEventListener('DOMContentLoaded', () => AssignmentManager.init());
