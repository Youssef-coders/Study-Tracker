// Analytics Module for Study Tracker
class Analytics {
  constructor() {
    this.subjects = this.getSubjectList();
    this.init();
  }

  getSubjectList() {
    // Get subjects from SubjectManager if available
    if (window.SubjectManager && window.SubjectManager.getSubjects) {
      return window.SubjectManager.getSubjects().map(s => s.name);
    }
    
    // Fallback to stored subjects or default
    const storedSubjects = LocalStorageManager.load('userSubjects') || [];
    if (storedSubjects.length > 0) {
      return storedSubjects.map(s => s.name);
    }
    
    // Default subjects for backward compatibility
    return ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Arabic', 'Business', 'Accounting'];
  }

  updateSubjects(newSubjects) {
    this.subjects = newSubjects;
    this.renderSubjectHours();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupAnalytics());
    } else {
      this.setupAnalytics();
    }
  }

  setupAnalytics() {
    this.loadAnalyticsData();
    this.setupGoalModal();
    this.updateProgressBars();
    this.renderSubjectHours();
    this.renderWeeklyChart();
    
    // Refresh data every minute
    setInterval(() => {
      this.loadAnalyticsData();
      this.updateProgressBars();
    }, 60000);
  }

  // Get current date keys for storage
  getDateKey(date = new Date()) {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  getWeekKey(date = new Date()) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    return this.getDateKey(startOfWeek);
  }

  getMonthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  // Get study hours for different time periods
  getHoursToday() {
    const today = this.getDateKey();
    const dailyHours = LocalStorageManager.load('dailyHours') || {};
    return dailyHours[today] || 0;
  }

  getHoursThisWeek() {
    const today = new Date();
    let totalHours = 0;
    
    // Get all days of current week
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + i);
      const dateKey = this.getDateKey(date);
      
      const dailyHours = LocalStorageManager.load('dailyHours') || {};
      totalHours += dailyHours[dateKey] || 0;
    }
    
    return totalHours;
  }

  getHoursThisMonth() {
    const monthKey = this.getMonthKey();
    const monthlyHours = LocalStorageManager.load('monthlyHours') || {};
    return monthlyHours[monthKey] || 0;
  }

  // Get subject-specific hours
  getSubjectHours(subject, period = 'month') {
    const subjectHours = LocalStorageManager.load('subjectHours') || {};
    
    if (period === 'today') {
      const today = this.getDateKey();
      return (subjectHours[subject] && subjectHours[subject][today]) || 0;
    } else if (period === 'week') {
      const today = new Date();
      let totalHours = 0;
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - today.getDay() + i);
        const dateKey = this.getDateKey(date);
        
        totalHours += (subjectHours[subject] && subjectHours[subject][dateKey]) || 0;
      }
      
      return totalHours;
    } else {
      // Month
      const monthKey = this.getMonthKey();
      const monthlySubjectHours = LocalStorageManager.load('monthlySubjectHours') || {};
      return (monthlySubjectHours[subject] && monthlySubjectHours[subject][monthKey]) || 0;
    }
  }

  // Record study hours for a subject
  recordStudyHours(subject, hours) {
    const today = this.getDateKey();
    const monthKey = this.getMonthKey();
    
    // Update daily hours
    const dailyHours = LocalStorageManager.load('dailyHours') || {};
    dailyHours[today] = (dailyHours[today] || 0) + hours;
    LocalStorageManager.save('dailyHours', dailyHours);
    
    // Update monthly hours
    const monthlyHours = LocalStorageManager.load('monthlyHours') || {};
    monthlyHours[monthKey] = (monthlyHours[monthKey] || 0) + hours;
    LocalStorageManager.save('monthlyHours', monthlyHours);
    
    // Update subject hours
    const subjectHours = LocalStorageManager.load('subjectHours') || {};
    if (!subjectHours[subject]) subjectHours[subject] = {};
    subjectHours[subject][today] = (subjectHours[subject][today] || 0) + hours;
    LocalStorageManager.save('subjectHours', subjectHours);
    
    // Update monthly subject hours
    const monthlySubjectHours = LocalStorageManager.load('monthlySubjectHours') || {};
    if (!monthlySubjectHours[subject]) monthlySubjectHours[subject] = {};
    monthlySubjectHours[subject][monthKey] = (monthlySubjectHours[subject][monthKey] || 0) + hours;
    LocalStorageManager.save('monthlySubjectHours', monthlySubjectHours);
  }

  loadAnalyticsData() {
    // Update overview cards
    const hoursToday = this.getHoursToday();
    const hoursWeek = this.getHoursThisWeek();
    const hoursMonth = this.getHoursThisMonth();
    
    const todayElement = document.getElementById('hoursToday');
    const weekElement = document.getElementById('hoursWeek');
    const monthElement = document.getElementById('hoursMonth');
    
    if (todayElement) todayElement.textContent = `${hoursToday}h`;
    if (weekElement) weekElement.textContent = `${hoursWeek}h`;
    if (monthElement) monthElement.textContent = `${hoursMonth}h`;
  }

  setupGoalModal() {
    const setGoalBtn = document.getElementById('setGoalBtn');
    const goalModal = document.getElementById('goalModal');
    const closeBtn = goalModal?.querySelector('.close-btn');
    const cancelBtn = goalModal?.querySelector('.cancel-btn');
    const goalForm = document.getElementById('goalForm');
    
    if (!setGoalBtn || !goalModal) return;
    
    // Load current goals
    const goals = LocalStorageManager.load('studyGoals') || { daily: 2, weekly: 14 };
    document.getElementById('dailyGoal').value = goals.daily;
    document.getElementById('weeklyGoal').value = goals.weekly;
    
    setGoalBtn.addEventListener('click', () => {
      goalModal.style.display = 'block';
    });
    
    closeBtn?.addEventListener('click', () => {
      goalModal.style.display = 'none';
    });
    
    cancelBtn?.addEventListener('click', () => {
      goalModal.style.display = 'none';
    });
    
    goalModal.addEventListener('click', (e) => {
      if (e.target === goalModal) {
        goalModal.style.display = 'none';
      }
    });
    
    goalForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const dailyGoal = parseFloat(document.getElementById('dailyGoal').value);
      const weeklyGoal = parseFloat(document.getElementById('weeklyGoal').value);
      
      if (dailyGoal > 0 && weeklyGoal > 0) {
        LocalStorageManager.save('studyGoals', { daily: dailyGoal, weekly: weeklyGoal });
        goalModal.style.display = 'none';
        this.updateProgressBars();
        
        if (window.Notify) {
          Notify.success('Study goals updated successfully!');
        }
      } else {
        if (window.Notify) {
          Notify.error('Please enter valid goal values');
        }
      }
    });
  }

  updateProgressBars() {
    const goals = LocalStorageManager.load('studyGoals') || { daily: 2, weekly: 14 };
    const hoursToday = this.getHoursToday();
    const hoursWeek = this.getHoursThisWeek();
    
    // Update daily progress
    const dailyProgress = Math.min((hoursToday / goals.daily) * 100, 100);
    const dailyProgressElement = document.getElementById('dailyProgress');
    const dailyProgressText = document.getElementById('dailyProgressText');
    
    if (dailyProgressElement) {
      dailyProgressElement.style.width = `${dailyProgress}%`;
    }
    if (dailyProgressText) {
      dailyProgressText.textContent = `${hoursToday}/${goals.daily} hours`;
    }
    
    // Update weekly progress
    const weeklyProgress = Math.min((hoursWeek / goals.weekly) * 100, 100);
    const weeklyProgressElement = document.getElementById('weeklyProgress');
    const weeklyProgressText = document.getElementById('weeklyProgressText');
    
    if (weeklyProgressElement) {
      weeklyProgressElement.style.width = `${weeklyProgress}%`;
    }
    if (weeklyProgressText) {
      weeklyProgressText.textContent = `${hoursWeek}/${goals.weekly} hours`;
    }
  }

  renderSubjectHours() {
    const container = document.getElementById('subjectHours');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.subjects.forEach(subject => {
      const hours = this.getSubjectHours(subject, 'month');
      
      const subjectCard = document.createElement('div');
      subjectCard.className = 'subject-hour-card';
      subjectCard.innerHTML = `
        <h4>${subject}</h4>
        <div class="subject-hours">${hours}h</div>
        <div class="subject-bar">
          <div class="subject-fill" style="width: ${Math.min((hours / 20) * 100, 100)}%"></div>
        </div>
      `;
      
      container.appendChild(subjectCard);
    });
  }

  renderWeeklyChart() {
    const container = document.getElementById('weeklyChart');
    if (!container) return;
    
    // Simple bar chart for the last 7 days
    const today = new Date();
    const chartData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = this.getDateKey(date);
      const dailyHours = LocalStorageManager.load('dailyHours') || {};
      const hours = dailyHours[dateKey] || 0;
      
      chartData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: hours
      });
    }
    
    const maxHours = Math.max(...chartData.map(d => d.hours), 1);
    
    container.innerHTML = `
      <div class="chart-bars">
        ${chartData.map(data => `
          <div class="chart-bar">
            <div class="bar-fill" style="height: ${(data.hours / maxHours) * 100}%"></div>
            <div class="bar-label">${data.day}</div>
            <div class="bar-value">${data.hours}h</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Method to be called when adding study hours
  static addStudyHour(subject = 'General') {
    const analytics = new Analytics();
    analytics.recordStudyHours(subject, 1);
    
    // Update displays if on analytics page
    if (window.location.pathname.includes('analytics.html')) {
      analytics.loadAnalyticsData();
      analytics.updateProgressBars();
      analytics.renderSubjectHours();
      analytics.renderWeeklyChart();
    }
  }
}

// Initialize Analytics when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('analytics.html')) {
      new Analytics();
    }
  });
} else {
  if (window.location.pathname.includes('analytics.html')) {
    new Analytics();
  }
}

// Export for use in other modules
window.Analytics = Analytics;
