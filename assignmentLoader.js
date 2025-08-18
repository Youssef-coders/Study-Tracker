class AssignmentLoader {
  static init() {
    console.log('AssignmentLoader initializing...');
    
    // Check for either assigncontainer (dashboard) or curric-card (homework page)
    const container = document.querySelector('.assigncontainer') || document.querySelector('.curric-card');
    if (!container) {
      console.log('No assignment container found, skipping initialization');
      return;
    }
    
    console.log('Assignment container found, loading assignments...');
    // this.buildFilters(); // search disabled
    this.loadUpcomingAssignments();
  }

  static loadUpcomingAssignments() {
    console.log('Loading upcoming assignments...');
    const startTime = performance.now();
    
    try {
      const arr = LocalStorageManager.load('assignments') || [];
      console.log(`Found ${arr.length} total assignments`);
      // Remove filters/search; just show all non-completed
      const q = '';
      const subj = 'All';
      const upcoming = arr
        .filter(a => a.status !== 'Completed')
        .filter(a => !q || (a.name?.toLowerCase().includes(q) || a.subject?.toLowerCase().includes(q)))
        .filter(a => subj === 'All' || a.subject === subj)
        .sort((a,b)=> new Date(a.dueDate)-new Date(b.dueDate));
      console.log(`Filtered to ${upcoming.length} upcoming assignments`);
      this.renderAssignments(upcoming);
      
      const endTime = performance.now();
      console.log(`Assignment loading took ${endTime - startTime}ms`);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  }

  static renderAssignments(assignments) {
    console.log('Rendering assignments...');
    const startTime = performance.now();
    
    try {
      const container = document.querySelector('.assigncontainer') || document.querySelector('.curric-card');
      if (!container) {
        console.error('No container found for rendering assignments');
        return;
      }
      
      // Clear container fully (no filters bar)
      container.innerHTML = '';
      
      console.log(`Rendering ${assignments.length} assignments...`);
      
      if (assignments.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No assignments yet';
        container.appendChild(empty);
        return;
      }

      assignments.forEach((a, index) => {
        const due = new Date(a.dueDate); due.setHours(0,0,0,0);
        const today = new Date(); today.setHours(0,0,0,0);
        const diff = Math.round((due - today) / (1000*60*60*24));
        const dueText = diff < 0 ? `Overdue by ${Math.abs(diff)} days` : (diff===0 ? 'Due Today' : `Due in ${diff} ${diff===1?'Day':'Days'}`);
        
        const el = document.createElement('div');
        el.className = 'upassign';
        el.innerHTML = `
          <h4>${a.name}</h4>
          <h4>${a.subject}</h4>
          <h4>${dueText}</h4>
          <h4>${a.status}</h4>
          <div class="assign-actions">
            <button class=\"edit-status-btn\" data-id=\"${a.id || a.name}\" data-status=\"${a.status}\">Edit Status</button>
            <button class=\"delete-assign-btn\" data-id=\"${a.id || ''}\">Delete</button>
          </div>
        `;
        
        // Add event listener for edit status button
        const editBtn = el.querySelector('.edit-status-btn');
        editBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.editAssignmentStatus(a);
        });
        const delBtn = el.querySelector('.delete-assign-btn');
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.deleteAssignment(a);
        });
        
        container.appendChild(el);
      });
      
      const endTime = performance.now();
      console.log(`Assignment rendering took ${endTime - startTime}ms`);
    } catch (error) {
      console.error('Error rendering assignments:', error);
    }
  }

  static editAssignmentStatus(assignment) {
    console.log('Editing assignment status...');
    const startTime = performance.now();
    
    try {
      const statuses = ['Not Started', 'In Progress', 'Completed'];
      const currentIndex = statuses.indexOf(assignment.status);
      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
      
      console.log(`Changing status from ${assignment.status} to ${nextStatus}`);
      
      // Update assignment status
      assignment.status = nextStatus;
      
      // If completed, remove from assignments
      if (nextStatus === 'Completed') {
        this.removeCompletedAssignment(assignment);
      } else {
        // Update in localStorage
        this.updateAssignmentInStorage(assignment);
      }
      
      // Refresh the display
      this.loadUpcomingAssignments();
      try { Notify && Notify.info(`Status changed to ${nextStatus}`); } catch(e) {}
      
      const endTime = performance.now();
      console.log(`Status update took ${endTime - startTime}ms`);
    } catch (error) {
      console.error('Error updating assignment status:', error);
    }
  }

  static removeCompletedAssignment(assignment) {
    const assignments = LocalStorageManager.load('assignments') || [];
    const updatedAssignments = assignments.filter(a => 
      !(a.name === assignment.name && a.subject === assignment.subject && a.dueDate === assignment.dueDate)
    );
    LocalStorageManager.save('assignments', updatedAssignments);
  }

  static updateAssignmentInStorage(assignment) {
    const assignments = LocalStorageManager.load('assignments') || [];
    const index = assignments.findIndex(a => 
      a.name === assignment.name && a.subject === assignment.subject && a.dueDate === assignment.dueDate
    );
    
    if (index !== -1) {
      assignments[index] = assignment;
      LocalStorageManager.save('assignments', assignments);
    }
  }

  static deleteAssignment(assignment) {
    try {
      const assignments = LocalStorageManager.load('assignments') || [];
      const updated = assignments.filter(a => {
        if (assignment.id && a.id) return a.id !== assignment.id;
        return !(a.name === assignment.name && a.subject === assignment.subject && a.dueDate === assignment.dueDate);
      });
      LocalStorageManager.save('assignments', updated);
      try { Notify && Notify.success('Assignment deleted'); } catch(e) {}
      this.loadUpcomingAssignments();
    } catch (e) { console.error('Error deleting assignment', e); }
  }

  static buildFilters() {
    const container = document.querySelector('.curric-card');
    if (!container) return;
    if (container.querySelector('.assign-filters')) return;
    const bar = document.createElement('div');
    bar.className = 'assign-filters';
    bar.innerHTML = `
      <input id="assign-search" type="text" placeholder="Search assignments..." />
      <select id="assign-subject"><option>All</option></select>
    `;
    container.insertBefore(bar, container.firstChild);
    bar.addEventListener('input', () => this.loadUpcomingAssignments());
    bar.addEventListener('change', () => this.loadUpcomingAssignments());
  }

  static populateSubjects(arr){
    try{
      const select = document.getElementById('assign-subject');
      if (!select) return;
      const current = select.value || 'All';
      const set = Array.from(new Set(arr.map(a=>a.subject).filter(Boolean)));
      select.innerHTML = '<option>All</option>' + set.map(s=>`<option${s===current?' selected':''}>${s}</option>`).join('');
    }catch(e){}
  }
}
document.addEventListener('DOMContentLoaded', ()=>AssignmentLoader.init());


