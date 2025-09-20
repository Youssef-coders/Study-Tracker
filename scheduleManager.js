// Schedule Manager for Calendar System
class ScheduleManager {
  constructor() {
    this.currentDate = new Date();
    this.events = this.loadEvents();
    this.subjects = this.getSubjectList();
    this.setupCalendar();
    this.loadAssignments();
  }

  static init() {
    if (window.location.pathname.includes('schedule.html')) {
      new ScheduleManager();
    }
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
    
    // Default subjects
    return ['Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Arabic', 'Business', 'Accounting'];
  }

  setupCalendar() {
    this.renderCalendar();
    this.setupEventHandlers();
    this.populateSubjects();
  }

  setupEventHandlers() {
    // Navigation buttons
    document.getElementById('prevMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    document.getElementById('todayBtn').addEventListener('click', () => {
      this.currentDate = new Date();
      this.renderCalendar();
    });

    // Add event button
    document.getElementById('addEventBtn').addEventListener('click', () => {
      this.showEventModal();
    });

    // Event modal
    const modal = document.getElementById('eventModal');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = document.getElementById('eventForm');

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEvent();
    });

    // Color presets
    document.querySelectorAll('.color-preset').forEach(preset => {
      preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        document.getElementById('eventColor').value = color;
      });
    });
  }

  populateSubjects() {
    const subjectSelect = document.getElementById('eventSubject');
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    
    this.subjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject;
      option.textContent = subject;
      subjectSelect.appendChild(option);
    });
  }

  renderCalendar() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Update header
    const monthHeader = document.getElementById('currentMonth');
    monthHeader.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

    // Get first day of month and number of days
    const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Clear previous days
    const daysContainer = document.getElementById('calendarDays');
    daysContainer.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      daysContainer.appendChild(emptyDay);
    }

    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      
      const currentDateStr = this.formatDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day));
      
      // Check if it's today
      if (
        this.currentDate.getFullYear() === today.getFullYear() &&
        this.currentDate.getMonth() === today.getMonth() &&
        day === today.getDate()
      ) {
        dayElement.classList.add('today');
      }

      dayElement.innerHTML = `
        <div class="day-number">${day}</div>
        <div class="day-events" id="events-${currentDateStr}"></div>
      `;

      // Add click handler for adding events
      dayElement.addEventListener('click', () => {
        this.showEventModal(currentDateStr);
      });

      daysContainer.appendChild(dayElement);
    }

    // Render events for this month
    this.renderEvents();
  }

  renderEvents() {
    // Clear existing events
    document.querySelectorAll('.day-events').forEach(container => {
      container.innerHTML = '';
    });

    // Render each event
    this.events.forEach(event => {
      const eventContainer = document.getElementById(`events-${event.date}`);
      if (eventContainer) {
        const eventElement = document.createElement('div');
        eventElement.className = `event-item event-${event.type}`;
        eventElement.style.backgroundColor = event.color;
        eventElement.style.color = this.getContrastColor(event.color);
        eventElement.innerHTML = `
          <div class="event-title">${event.title}</div>
          ${event.time ? `<div class="event-time">${event.time}</div>` : ''}
        `;

        // Add click handler for editing
        eventElement.addEventListener('click', (e) => {
          e.stopPropagation();
          this.editEvent(event);
        });

        eventContainer.appendChild(eventElement);
      }
    });
  }

  showEventModal(selectedDate = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const titleElement = document.getElementById('eventModalTitle');

    // Reset form
    form.reset();
    titleElement.textContent = 'Add Event';
    
    // Set default date if provided
    if (selectedDate) {
      document.getElementById('eventDate').value = selectedDate;
    } else {
      document.getElementById('eventDate').value = this.formatDate(new Date());
    }

    // Set default color
    document.getElementById('eventColor').value = '#2B5D8A';

    modal.style.display = 'block';
  }

  editEvent(event) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const titleElement = document.getElementById('eventModalTitle');

    titleElement.textContent = 'Edit Event';

    // Populate form with event data
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventType').value = event.type;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventSubject').value = event.subject || '';
    document.getElementById('eventDescription').value = event.description || '';
    document.getElementById('eventColor').value = event.color;

    // Store event ID for updating
    form.dataset.eventId = event.id;

    modal.style.display = 'block';
  }

  saveEvent() {
    const form = document.getElementById('eventForm');
    const eventId = form.dataset.eventId;

    const eventData = {
      id: eventId || Date.now().toString(),
      title: document.getElementById('eventTitle').value,
      type: document.getElementById('eventType').value,
      date: document.getElementById('eventDate').value,
      time: document.getElementById('eventTime').value,
      subject: document.getElementById('eventSubject').value,
      description: document.getElementById('eventDescription').value,
      color: document.getElementById('eventColor').value,
      createdAt: eventId ? this.events.find(e => e.id === eventId)?.createdAt : new Date().toISOString()
    };

    if (eventId) {
      // Update existing event
      const index = this.events.findIndex(e => e.id === eventId);
      if (index !== -1) {
        this.events[index] = eventData;
      }
    } else {
      // Add new event
      this.events.push(eventData);
    }

    // Save to storage
    LocalStorageManager.save('scheduleEvents', this.events);

    // Close modal and refresh calendar
    document.getElementById('eventModal').style.display = 'none';
    form.removeAttribute('data-event-id');
    this.renderEvents();

    // Show success notification
    if (window.Notify) {
      Notify.success(eventId ? 'Event updated successfully!' : 'Event added successfully!');
    }
  }

  loadEvents() {
    const events = LocalStorageManager.load('scheduleEvents') || [];
    return events;
  }

  loadAssignments() {
    // Import assignments from homework system
    const assignments = LocalStorageManager.load('assignments') || [];
    
    assignments.forEach(assignment => {
      // Check if assignment already exists as an event
      const existingEvent = this.events.find(e => 
        e.type === 'assignment' && 
        e.title === assignment.name &&
        e.date === assignment.dueDate
      );

      if (!existingEvent) {
        // Add assignment as an event
        const assignmentEvent = {
          id: `assignment-${assignment.id || assignment.name}`,
          title: assignment.name,
          type: 'assignment',
          date: assignment.dueDate,
          time: '',
          subject: assignment.subject,
          description: `Assignment due - Status: ${assignment.status}`,
          color: this.getUrgencyColor(assignment.urgency),
          createdAt: assignment.createdAt || new Date().toISOString(),
          isImported: true
        };

        this.events.push(assignmentEvent);
      }
    });

    // Save updated events
    LocalStorageManager.save('scheduleEvents', this.events);
  }

  getUrgencyColor(urgency) {
    switch (urgency) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#FF5722';
      case 'critical': return '#F44336';
      default: return '#2B5D8A';
    }
  }

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return black or white based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  ScheduleManager.init();
});
