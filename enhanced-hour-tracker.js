// Enhanced Hour Tracker with Subject Selection
class EnhancedHourTracker {
  constructor() {
    this.subjects = this.getSubjectList();
    this.init();
  }

  getSubjectList() {
    // Get subjects from SubjectManager if available
    if (window.SubjectManager && window.SubjectManager.getSubjects) {
      return window.SubjectManager.getSubjects();
    }
    
    // Fallback to stored subjects or default
    const storedSubjects = LocalStorageManager.load('userSubjects') || [];
    if (storedSubjects.length > 0) {
      return storedSubjects;
    }
    
    // Default subjects for backward compatibility
    return [
      { name: 'Mathematics', color: '#2B5D8A' },
      { name: 'Physics', color: '#8B4513' },
      { name: 'Chemistry', color: '#228B22' }
    ];
  }

  init() {
    // Enhance the existing hour tracking on dashboard
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      this.loadSavedHours();
      this.enhanceDashboardHourTracker();
      this.scheduleMidnightReset();
    }
  }

  loadSavedHours() {
    console.log('Enhanced tracker loading saved hours...');
    // Load and display saved hours on page load
    const h1 = document.querySelector('.hourcard h1');
    console.log('Hour display element:', h1);
    
    // Use local date instead of UTC to avoid timezone issues
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    const hoursDate = localStorage.getItem('hoursDate');
    const savedHours = localStorage.getItem('studyHours');
    
    console.log('Today (local):', todayStr);
    console.log('Saved date:', hoursDate);
    console.log('Saved hours:', savedHours);

    // Only reset hours if it's actually a different day
    if (hoursDate && hoursDate !== todayStr) {
      console.log('Different date detected, resetting hours');
      localStorage.setItem('studyHours', '0');
      localStorage.setItem('hoursDate', todayStr);
    } else if (!hoursDate) {
      console.log('No saved date, setting today as date');
      localStorage.setItem('hoursDate', todayStr);
      // Don't reset hours if there are any saved
      if (!localStorage.getItem('studyHours')) {
        localStorage.setItem('studyHours', '0');
      }
    } else {
      console.log('Same date, keeping existing hours');
    }

    const hours = parseInt(localStorage.getItem('studyHours')) || 0;
    console.log('Final hours to display:', hours);
    if (h1) {
      h1.textContent = hours;
      console.log('Updated display to:', hours);
    }
  }

  enhanceDashboardHourTracker() {
    const addHourBtn = document.getElementById('addHourBtn');
    if (!addHourBtn) return;

    // Create subject selection modal
    this.createSubjectModal();
    
    // Replace the default click handler
    const newAddHourBtn = addHourBtn.cloneNode(true);
    addHourBtn.parentNode.replaceChild(newAddHourBtn, addHourBtn);
    
    newAddHourBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSubjectModal();
    });
  }

  createSubjectModal() {
    // Check if modal already exists
    if (document.getElementById('subjectHourModal')) return;

    const modal = document.createElement('div');
    modal.id = 'subjectHourModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Add Study Hour</h2>
        <div class="subject-selection">
          <h3>Select Subject:</h3>
          <div class="subject-grid">
            ${this.subjects.map(subject => `
              <button class="subject-btn" data-subject="${subject.name}" style="border-color: ${subject.color}; --subject-color: ${subject.color}">
                ${subject.name}
              </button>
            `).join('')}
            <button class="subject-btn" data-subject="General" style="border-color: #666; --subject-color: #666">
              General Study
            </button>
          </div>
        </div>
        <div class="hour-input-section">
          <label for="hoursToAdd">Hours to add:</label>
          <input type="number" id="hoursToAdd" min="0.25" max="8" step="0.25" value="1">
        </div>
        <div class="modal-actions">
          <button id="confirmAddHour" class="save-btn">Add Hours</button>
          <button class="cancel-btn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupModalEvents(modal);
  }

  setupModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const confirmBtn = modal.querySelector('#confirmAddHour');
    const subjectBtns = modal.querySelectorAll('.subject-btn');
    const hoursInput = modal.querySelector('#hoursToAdd');

    let selectedSubject = 'General';

    // Close modal events
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Subject selection
    subjectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subjectBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSubject = btn.dataset.subject;
      });
    });

    // Set default selection
    subjectBtns[subjectBtns.length - 1].classList.add('selected'); // General Study

    // Confirm button
    confirmBtn.addEventListener('click', () => {
      const hours = parseFloat(hoursInput.value) || 1;
      this.addStudyHours(selectedSubject, hours);
      modal.style.display = 'none';
      
      // Reset for next time
      hoursInput.value = '1';
      subjectBtns.forEach(b => b.classList.remove('selected'));
      subjectBtns[subjectBtns.length - 1].classList.add('selected');
    });
  }

  showSubjectModal() {
    const modal = document.getElementById('subjectHourModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  addStudyHours(subject, hours) {
    console.log('Adding study hours:', subject, hours);
    try {
      // Update dashboard display first
      this.updateDashboardHours(hours);
      console.log('Dashboard updated');
      
      // Record in analytics system - always use fallback for now
      console.log('Recording hours directly...');
      this.recordHoursDirectly(subject, hours);
      
      // Record study session
      if (window.StreakCounter && typeof StreakCounter.recordStudySession === 'function') {
        console.log('Recording study session...');
        StreakCounter.recordStudySession();
      }

      // Log session for Firebase (optional)
      if (window.FirebaseManager && typeof FirebaseManager.logStudySession === 'function') {
        console.log('Logging to Firebase...');
        FirebaseManager.logStudySession({
          subject: subject,
          hours: hours,
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString()
        });
      }

      // Show success notification
      if (window.Notify && typeof Notify.success === 'function') {
        console.log('Showing success notification...');
        Notify.success(`Added ${hours} hour${hours !== 1 ? 's' : ''} for ${subject}!`);
      } else {
        console.log('Notify not available, showing alert...');
        alert(`Added ${hours} hour${hours !== 1 ? 's' : ''} for ${subject}!`);
      }
    } catch (error) {
      console.error('Error adding study hours:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Fallback error notification
      if (window.Notify && typeof Notify.error === 'function') {
        Notify.error('Error adding study hours. Please try again.');
      } else {
        alert('Error adding study hours. Please try again.');
      }
    }
  }

  updateDashboardHours(hours) {
    console.log('Updating dashboard hours by:', hours);
    // Update the main dashboard hour display
    const hourDisplay = document.querySelector('.hourcard h1');
    if (hourDisplay) {
      const currentHours = parseInt(hourDisplay.textContent) || 0;
      const newTotal = currentHours + hours;
      hourDisplay.textContent = newTotal;
      console.log('Updated display from', currentHours, 'to', newTotal);
      
      // Update localStorage with consistent date format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      localStorage.setItem('studyHours', String(newTotal));
      localStorage.setItem('hoursDate', todayStr);
      console.log('Saved to localStorage:', newTotal, 'hours for date:', todayStr);
    }
  }

  recordHoursDirectly(subject, hours) {
    try {
      console.log('Recording hours directly:', subject, hours);
      // Use consistent local date format
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      const monthKey = `${year}-${month}`;
      
      console.log('Date keys:', todayStr, monthKey);
      
      // Update daily hours
      const dailyHours = LocalStorageManager.load('dailyHours') || {};
      dailyHours[todayStr] = (dailyHours[todayStr] || 0) + hours;
      LocalStorageManager.save('dailyHours', dailyHours);
      console.log('Daily hours updated:', dailyHours);
      
      // Update monthly hours
      const monthlyHours = LocalStorageManager.load('monthlyHours') || {};
      monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + hours;
      LocalStorageManager.save('monthlyHours', monthlyHours);
      console.log('Monthly hours updated:', monthlyHours);
      
      // Update subject hours
      const subjectHours = LocalStorageManager.load('subjectHours') || {};
      if (!subjectHours[subject]) subjectHours[subject] = {};
      subjectHours[subject][todayStr] = (subjectHours[subject][todayStr] || 0) + hours;
      LocalStorageManager.save('subjectHours', subjectHours);
      console.log('Subject hours updated:', subjectHours);
      
      // Update monthly subject hours
      const monthlySubjectHours = LocalStorageManager.load('monthlySubjectHours') || {};
      if (!monthlySubjectHours[subject]) monthlySubjectHours[subject] = {};
      monthlySubjectHours[subject][monthKey] = (monthlySubjectHours[subject][monthKey] || 0) + hours;
      LocalStorageManager.save('monthlySubjectHours', monthlySubjectHours);
      console.log('Monthly subject hours updated:', monthlySubjectHours);
      
      console.log('Hours recorded successfully');
    } catch (error) {
      console.error('Error recording hours directly:', error);
      throw error;
    }
  }

  scheduleMidnightReset() {
    // Schedule automatic midnight reset for hours (from original hourTracker.js)
    const h1 = document.querySelector('.hourcard h1');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      // Reset hours at midnight
      localStorage.setItem('studyHours', '0');
      localStorage.setItem('hoursDate', new Date().toISOString().split('T')[0]);
      if (h1) h1.textContent = '0';
      
      // Schedule the next reset (24 hours from now)
      setInterval(() => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem('studyHours', '0');
        localStorage.setItem('hoursDate', today);
        if (h1) h1.textContent = '0';
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilMidnight);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new EnhancedHourTracker();
});

// Add CSS for the subject modal
const style = document.createElement('style');
style.textContent = `
  .subject-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin: 20px 0;
  }
  
  .subject-btn {
    padding: 15px 10px;
    border: 2px solid var(--term-color, grey);
    background: white;
    color: var(--term-color, grey);
    border-radius: 10px;
    font-family: 'Excalifont';
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .subject-btn:hover {
    background: var(--term-color, grey);
    color: white;
    transform: translateY(-2px);
  }
  
  .subject-btn.selected {
    background: var(--term-color, grey);
    color: white;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  }
  
  .hour-input-section {
    margin: 20px 0;
  }
  
  .hour-input-section label {
    display: block;
    margin-bottom: 10px;
    font-family: 'Excalifont';
    font-weight: bold;
    color: var(--term-color, grey);
  }
  
  .hour-input-section input {
    width: 100%;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    font-family: 'Excalifont';
    box-sizing: border-box;
  }
  
  .hour-input-section input:focus {
    outline: none;
    border-color: var(--term-color, grey);
  }
  
  .subject-selection h3 {
    color: var(--term-color, grey);
    font-family: 'Excalifont';
    margin-bottom: 15px;
  }
`;
document.head.appendChild(style);
