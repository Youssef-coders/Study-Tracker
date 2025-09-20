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
      
      // Auto-set urgency to critical if due today, tomorrow, or overdue
      let urgency = a.urgency || 'medium';
      if (diff <= 1 && a.status !== 'Completed') { // Due today, tomorrow, or overdue
        urgency = 'critical';
      }
      
      const el = document.createElement('div');
      el.className = `upassign assignment-item urgency-${urgency}`;
      el.innerHTML = `
        <h4>${a.name}</h4>
        <h4>${a.subject}</h4>
        <h4>${dueText}</h4>
        <h4>${a.status}</h4>
        <div class="urgency-badge urgency-${urgency}">
          ${urgency.toUpperCase()}${diff <= 1 && a.status !== 'Completed' ? ' (AUTO)' : ''}
        </div>
      `;
      container.appendChild(el);
    });
  }
}
// Disabled to prevent conflicts with AssignmentLoader
// document.addEventListener('DOMContentLoaded', () => AssignmentManager.init());
