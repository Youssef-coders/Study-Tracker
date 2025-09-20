// Dynamic Subject Management System
class SubjectManager {
  constructor() {
    this.subjects = this.loadSubjects();
    this.defaultColors = [
      '#2B5D8A', '#8B4513', '#228B22', '#4B0082', 
      '#DC143C', '#FF8C00', '#008B8B', '#9932CC',
      '#B22222', '#32CD32', '#FF1493', '#00CED1'
    ];
    this.init();
  }

  init() {
    // Initialize subject management when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupSubjectManagement());
    } else {
      this.setupSubjectManagement();
    }
  }

  loadSubjects() {
    const stored = LocalStorageManager.load('userSubjects');
    if (stored && stored.length > 0) {
      return stored;
    }
    
    // Default subjects for first-time users (can be customized/removed)
    return [
      { id: 'math', name: 'Mathematics', color: '#2B5D8A', created: new Date().toISOString() },
      { id: 'physics', name: 'Physics', color: '#8B4513', created: new Date().toISOString() },
      { id: 'chemistry', name: 'Chemistry', color: '#228B22', created: new Date().toISOString() }
    ];
  }

  saveSubjects() {
    LocalStorageManager.save('userSubjects', this.subjects);
    this.updateSubjectDisplay();
    this.updateAnalyticsSubjects();
  }

  setupSubjectManagement() {
    if (window.location.pathname.includes('subjects.html')) {
      this.renderSubjectsPage();
    }
    
    // Update other pages that use subjects
    this.updateSubjectDisplay();
  }

  renderSubjectsPage() {
    const container = document.querySelector('body');
    if (!container) return;

    // Replace the hardcoded subject grid with dynamic content
    const existingGrids = document.querySelectorAll('.sro, .srtw, .srth');
    existingGrids.forEach(grid => grid.remove());

    // Create new dynamic subject grid
    const subjectSection = document.createElement('div');
    subjectSection.className = 'dynamic-subjects-section';
    subjectSection.innerHTML = `
      <div class="subjects-header">
        <h2>Your Subjects</h2>
        <button id="addSubjectBtn" class="add-subject-btn">+ Add New Subject</button>
      </div>
      <div class="subjects-grid" id="subjectsGrid">
        ${this.renderSubjectCards()}
      </div>
    `;

    // Insert after navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.parentNode.insertBefore(subjectSection, navbar.nextSibling);
    }

    this.setupSubjectEvents();
    this.createSubjectModal();
  }

  renderSubjectCards() {
    if (this.subjects.length === 0) {
      return `
        <div class="no-subjects">
          <p>No subjects added yet. Click "Add New Subject" to get started!</p>
        </div>
      `;
    }

    return this.subjects.map(subject => `
      <div class="subject-card" style="border-color: ${subject.color}; --subject-color: ${subject.color}">
        <div class="subject-header">
          <h3 style="color: ${subject.color}">${subject.name}</h3>
          <div class="subject-actions">
            <button class="edit-subject-btn" data-id="${subject.id}" title="Edit Subject">✏️</button>
            <button class="delete-subject-btn" data-id="${subject.id}" title="Delete Subject">🗑️</button>
          </div>
        </div>
        <div class="subject-links">
          <a href="javascript:void(0)" class="subject-link" style="background-color: ${subject.color}" data-subject-id="${subject.id}" data-page-type="curriculum">
            Curriculum
          </a>
          <a href="javascript:void(0)" class="subject-link" style="background-color: ${subject.color}" data-subject-id="${subject.id}" data-page-type="resources">
            Resources
          </a>
        </div>
      </div>
    `).join('');
  }

  setupSubjectEvents() {
    // Add subject button
    document.getElementById('addSubjectBtn')?.addEventListener('click', () => {
      this.showSubjectModal();
    });

    // Edit subject buttons
    document.querySelectorAll('.edit-subject-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subjectId = e.target.dataset.id;
        this.showSubjectModal(subjectId);
      });
    });

    // Delete subject buttons
    document.querySelectorAll('.delete-subject-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subjectId = e.target.dataset.id;
        this.deleteSubject(subjectId);
      });
    });

    // Subject page links
    document.querySelectorAll('.subject-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const subjectId = e.target.dataset.subjectId;
        const pageType = e.target.dataset.pageType;
        const subject = this.getSubject(subjectId);
        
        if (subject && window.DynamicPageHandler) {
          window.DynamicPageHandler.navigateToSubjectPage(subject, pageType);
        }
      });
    });
  }

  createSubjectModal() {
    if (document.getElementById('subjectModal')) return;

    const modal = document.createElement('div');
    modal.id = 'subjectModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2 id="modalTitle">Add New Subject</h2>
        <form id="subjectForm">
          <div class="form-group">
            <label for="subjectName">Subject Name:</label>
            <input type="text" id="subjectName" required placeholder="e.g., Advanced Mathematics">
          </div>
          
          <div class="form-group">
            <label for="subjectColor">Subject Color:</label>
            <div class="color-picker-container">
              <input type="color" id="subjectColor" value="#2B5D8A">
              <div class="preset-colors">
                ${this.defaultColors.map(color => `
                  <div class="color-preset" data-color="${color}" style="background-color: ${color}"></div>
                `).join('')}
              </div>
            </div>
          </div>
          
          
          <div class="modal-actions">
            <button type="submit" class="save-btn">Save Subject</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupModalEvents(modal);
  }

  setupModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = modal.querySelector('#subjectForm');
    const colorInput = modal.querySelector('#subjectColor');
    const presetColors = modal.querySelectorAll('.color-preset');

    // Close modal events
    closeBtn.addEventListener('click', () => this.hideSubjectModal());
    cancelBtn.addEventListener('click', () => this.hideSubjectModal());
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideSubjectModal();
    });

    // Color preset selection
    presetColors.forEach(preset => {
      preset.addEventListener('click', () => {
        const color = preset.dataset.color;
        colorInput.value = color;
        presetColors.forEach(p => p.classList.remove('selected'));
        preset.classList.add('selected');
      });
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubjectSubmission();
    });
  }

  showSubjectModal(subjectId = null) {
    const modal = document.getElementById('subjectModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('subjectForm');
    
    if (subjectId) {
      // Edit mode
      const subject = this.subjects.find(s => s.id === subjectId);
      if (subject) {
        modalTitle.textContent = 'Edit Subject';
        document.getElementById('subjectName').value = subject.name;
        document.getElementById('subjectColor').value = subject.color;
        form.dataset.editId = subjectId;
      }
    } else {
      // Add mode
      modalTitle.textContent = 'Add New Subject';
      form.reset();
      delete form.dataset.editId;
    }
    
    modal.style.display = 'block';
  }

  hideSubjectModal() {
    const modal = document.getElementById('subjectModal');
    modal.style.display = 'none';
  }

  handleSubjectSubmission() {
    const form = document.getElementById('subjectForm');
    const name = document.getElementById('subjectName').value.trim();
    const color = document.getElementById('subjectColor').value;
    
    if (!name) {
      if (window.Notify) Notify.error('Please enter a subject name');
      return;
    }

    const subjectId = form.dataset.editId || this.generateSubjectId(name);
    
    if (form.dataset.editId) {
      // Edit existing subject
      const index = this.subjects.findIndex(s => s.id === subjectId);
      if (index !== -1) {
        this.subjects[index] = {
          ...this.subjects[index],
          name,
          color,
          updated: new Date().toISOString()
        };
      }
    } else {
      // Add new subject
      const newSubject = {
        id: subjectId,
        name,
        color,
        created: new Date().toISOString()
      };
      
      this.subjects.push(newSubject);
      
      // Create directory structure and pages
      this.createSubjectPages(newSubject);
    }
    
    this.saveSubjects();
    this.hideSubjectModal();
    
    // Refresh the display
    if (window.location.pathname.includes('subjects.html')) {
      document.getElementById('subjectsGrid').innerHTML = this.renderSubjectCards();
      this.setupSubjectEvents();
    }
    
    if (window.Notify) {
      Notify.success(`Subject ${form.dataset.editId ? 'updated' : 'created'} successfully!`);
    }
  }

  generateSubjectId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }

  deleteSubject(subjectId) {
    const subject = this.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    if (confirm(`Are you sure you want to delete "${subject.name}"? This will also delete all curriculum and resources data.`)) {
      this.subjects = this.subjects.filter(s => s.id !== subjectId);
      this.saveSubjects();
      
      // Remove subject data
      LocalStorageManager.remove(`curriculum_${subjectId}`);
      LocalStorageManager.remove(`resources_${subjectId}`);
      
      // Refresh display
      if (window.location.pathname.includes('subjects.html')) {
        document.getElementById('subjectsGrid').innerHTML = this.renderSubjectCards();
        this.setupSubjectEvents();
      }
      
      if (window.Notify) {
        Notify.success(`Subject "${subject.name}" deleted successfully`);
      }
    }
  }

  async createSubjectPages(subject) {
    try {
      // Create virtual page templates (like user accounts - no real files)
      const curriculumHTML = this.generateCurriculumPage(subject);
      const resourcesHTML = this.generateResourcesPage(subject);
      
      // Store page templates in localStorage for virtual access
      LocalStorageManager.save(`page_${subject.id}_curriculum`, curriculumHTML);
      LocalStorageManager.save(`page_${subject.id}_resources`, resourcesHTML);
      
      // Initialize empty curriculum and resources data
      LocalStorageManager.save(`curriculum_${subject.id}`, []);
      LocalStorageManager.save(`resources_${subject.id}`, []);
      
      console.log(`Virtual pages created for subject: ${subject.name}`);
      
    } catch (error) {
      console.error('Error creating virtual subject pages:', error);
    }
  }

  generateCurriculumPage(subject) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Subjects - ${subject.name}</title>
  <link rel="stylesheet" href="style.css?v=1" />
  <script src="loader.js"></script>
  <style>
    :root {
      --term-color: ${subject.color};
      --term-color-rgb: ${this.hexToRgb(subject.color)};
    }
  </style>
</head>
<body class="term-0">
  <header>SUBJECTS</header>
  <div class="headerspacer"></div>
  <div class="sidewallleft"></div>
  <div class="sidewallright"></div>
  <h1 class="subtitle">${subject.name.toUpperCase()}</h1>

  <div class="subbar">
    <a class="term-element back-to-subjects" href="javascript:void(0)">Back</a>
    <a href="javascript:void(0)" class="active term-element nav-curriculum">Curriculum</a>
    <a class="term-element nav-resources" href="javascript:void(0)">Resources</a>
  </div>

  <div class="card-header">
    <h3 class="card-title">Curriculum</h3>
    <div class="button-group">
      <button class="addlesson">Add Lesson</button>
      <button class="addchapter">Add Chapter</button>
    </div>
  </div>

  <div class="curric-card" data-subject-id="${subject.id}">
    <p>No curriculum items yet. Add lessons and chapters to get started!</p>
  </div>

  <script src="localStorageManager.js"></script>
  <script src="termController.js"></script>
  <script src="dateManager.js"></script>
  <script src="subjectManager.js"></script>
  <script src="curriculumTracker.js"></script>
  <script src="progressUpdater.js"></script>
  <script src="lessonManager.js"></script>
  <script src="darkMode.js"></script>
  <script src="blackoutMode.js"></script>
  <script src="notify.js"></script>
  <script>
    // Set subject context for lesson manager
    window.CURRENT_SUBJECT = {
      id: '${subject.id}',
      name: '${subject.name}',
      color: '${subject.color}'
    };
  </script>
</body>
</html>`;
  }

  generateResourcesPage(subject) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Resources - ${subject.name}</title>
  <link rel="stylesheet" href="style.css?v=1" />
  <script src="loader.js"></script>
  <style>
    :root {
      --term-color: ${subject.color};
      --term-color-rgb: ${this.hexToRgb(subject.color)};
    }
  </style>
</head>
<body class="term-0">
  <header>RESOURCES</header>
  <div class="headerspacer"></div>
  <div class="sidewallleft"></div>
  <div class="sidewallright"></div>
  <h1 class="subtitle">${subject.name.toUpperCase()}</h1>

  <div class="subbar">
    <a class="term-element back-to-subjects" href="javascript:void(0)">Back</a>
    <a class="term-element nav-curriculum" href="javascript:void(0)">Curriculum</a>
    <a href="javascript:void(0)" class="active term-element nav-resources">Resources</a>
  </div>

  <div class="card-header">
    <h3 class="card-title">Resources</h3>
    <div class="button-group">
      <button class="addresource">Add Resource</button>
    </div>
  </div>

  <div class="curric-card" data-subject-id="${subject.id}">
    <p>No resources yet. Add resources to get started!</p>
  </div>

  <script src="localStorageManager.js"></script>
  <script src="termController.js"></script>
  <script src="subjectManager.js"></script>
  <script src="resourceManager.js"></script>
  <script src="darkMode.js"></script>
  <script src="blackoutMode.js"></script>
  <script src="notify.js"></script>
  <script>
    // Set subject context for resource manager
    window.CURRENT_SUBJECT = {
      id: '${subject.id}',
      name: '${subject.name}',
      color: '${subject.color}'
    };
  </script>
</body>
</html>`;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '43, 93, 138';
  }

  updateSubjectDisplay() {
    // Update any subject dropdowns or lists on other pages
    const subjectSelects = document.querySelectorAll('select[id*="subject"], select[id*="Subject"]');
    subjectSelects.forEach(select => {
      const currentValue = select.value;
      select.innerHTML = '<option value="">Select Subject</option>' +
        this.subjects.map(subject => 
          `<option value="${subject.name}">${subject.name}</option>`
        ).join('');
      select.value = currentValue;
    });
  }

  updateAnalyticsSubjects() {
    // Update analytics system with new subjects
    if (window.Analytics && typeof window.Analytics.updateSubjects === 'function') {
      window.Analytics.updateSubjects(this.subjects.map(s => s.name));
    }
  }

  getSubjects() {
    return this.subjects;
  }

  getSubject(id) {
    return this.subjects.find(s => s.id === id);
  }

  getSubjectByName(name) {
    return this.subjects.find(s => s.name === name);
  }
}

// Initialize subject manager
window.SubjectManager = new SubjectManager();

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SubjectManager;
}
