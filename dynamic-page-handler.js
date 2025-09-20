// Dynamic Page Handler for Subject Pages
class DynamicPageHandler {
  constructor() {
    this.init();
  }

  init() {
    // Check if we're on a subject page that doesn't exist
    this.handleMissingSubjectPages();
    
    // Handle dynamic navigation
    this.handleDynamicNavigation();
  }

  handleMissingSubjectPages() {
    const path = window.location.pathname;
    
    // Check if we're trying to access a subject page (either direct access or hash-based)
    const subjectPageMatch = path.match(/\/([^\/]+)\/(curriculum|resources)\.html$/) || 
                             window.location.hash.match(/#\/([^\/]+)\/(curriculum|resources)$/);
    
    if (subjectPageMatch) {
      const [, subjectId, pageType] = subjectPageMatch;
      
      // Wait for SubjectManager to be ready
      if (window.SubjectManager) {
        const subject = window.SubjectManager.getSubject(subjectId);
        
        if (subject) {
          // Load the virtual page content
          this.loadDynamicPage(subject, pageType);
        } else {
          // Subject doesn't exist, redirect to subjects page
          console.log(`Subject ${subjectId} not found, redirecting...`);
          this.redirectToSubjects();
        }
      } else {
        // SubjectManager not ready yet, wait a bit
        setTimeout(() => this.handleMissingSubjectPages(), 100);
      }
    }
  }

  loadDynamicPage(subject, pageType) {
    // Get the stored virtual page content
    const pageContent = LocalStorageManager.load(`page_${subject.id}_${pageType}`);
    
    if (pageContent) {
      // Parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(pageContent, 'text/html');
      
      // Update the page title
      document.title = doc.title;
      
      // Replace body content
      document.body.innerHTML = doc.body.innerHTML;
      
      // Fix any remaining hardcoded links after content replacement
      this.fixHardcodedLinks();
      
      // Update CSS variables in head
      this.updateSubjectCSS(subject);
      
      // Set current subject context
      window.CURRENT_SUBJECT = {
        id: subject.id,
        name: subject.name,
        color: subject.color
      };
      
      // Re-initialize scripts
      this.reinitializeScripts();
      
      console.log(`Loaded virtual ${pageType} page for ${subject.name}`);
    } else {
      // Generate virtual page on the fly
      console.log(`Generating virtual page for ${subject.name}`);
      this.generatePageOnFly(subject, pageType);
    }
  }

  updateSubjectCSS(subject) {
    // Remove existing subject style
    const existingStyle = document.querySelector('#subject-style');
    if (existingStyle) existingStyle.remove();
    
    // Add subject-specific CSS
    const style = document.createElement('style');
    style.id = 'subject-style';
    style.textContent = `
      :root {
        --term-color: ${subject.color};
        --term-color-rgb: ${this.hexToRgb(subject.color)};
      }
    `;
    document.head.appendChild(style);
  }

  fixHardcodedLinks() {
    // Fix any remaining hardcoded navigation links
    const hardcodedLinks = document.querySelectorAll('a[href="resources.html"], a[href="curriculum.html"], a[href="../subjects.html"]');
    
    hardcodedLinks.forEach(link => {
      const href = link.getAttribute('href');
      console.log(`Fixing hardcoded link: ${href}`);
      
      if (href === 'resources.html') {
        link.setAttribute('href', 'javascript:void(0)');
        link.classList.add('nav-resources');
        if (!link.classList.contains('active')) {
          link.classList.remove('active');
        }
      } else if (href === 'curriculum.html') {
        link.setAttribute('href', 'javascript:void(0)');
        link.classList.add('nav-curriculum');
        if (!link.classList.contains('active')) {
          link.classList.remove('active');
        }
      } else if (href === '../subjects.html' || href === 'subjects.html') {
        link.setAttribute('href', 'javascript:void(0)');
        link.classList.add('back-to-subjects');
      }
    });
    
    console.log(`Fixed ${hardcodedLinks.length} hardcoded links`);
  }

  reloadCSS() {
    // Remove existing CSS links
    const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
    existingLinks.forEach(link => link.remove());
    
    // Add CSS link with cache busting
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `style.css?v=${Date.now()}`;
    document.head.appendChild(cssLink);
    
    // Also add loader.js if needed
    if (!document.querySelector('script[src*="loader.js"]')) {
      const loaderScript = document.createElement('script');
      loaderScript.src = 'loader.js';
      document.head.appendChild(loaderScript);
    }
  }

  generatePageOnFly(subject, pageType) {
    const pageContent = pageType === 'curriculum' 
      ? this.generateCurriculumPage(subject)
      : this.generateResourcesPage(subject);
      
    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(pageContent, 'text/html');
    
    // Update the page title
    document.title = doc.title;
    
    // Replace body content
    document.body.innerHTML = doc.body.innerHTML;
    
    // Fix any remaining hardcoded links after content replacement
    this.fixHardcodedLinks();
    
    // Update CSS variables
    this.updateSubjectCSS(subject);
    
    // Set current subject context
    window.CURRENT_SUBJECT = {
      id: subject.id,
      name: subject.name,
      color: subject.color
    };
    
    // Store for future use
    LocalStorageManager.save(`page_${subject.id}_${pageType}`, pageContent);
    
    // Re-initialize scripts
    this.reinitializeScripts();
  }

  generateCurriculumPage(subject) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Subjects - ${subject.name}</title>
  <link rel="stylesheet" href="../style.css?v=1" />
  <script src="../loader.js"></script>
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
    <div class="welcome-message">
      <h3>Welcome to ${subject.name} Curriculum</h3>
      <p>Start building your curriculum by adding lessons and chapters.</p>
      <p style="color: ${subject.color}; font-weight: bold;">This subject was created on ${new Date(subject.created).toLocaleDateString()}</p>
    </div>
  </div>

  <script src="../localStorageManager.js"></script>
  <script src="../termController.js"></script>
  <script src="../dateManager.js"></script>
  <script src="../subjectManager.js"></script>
  <script src="../curriculumTracker.js"></script>
  <script src="../progressUpdater.js"></script>
  <script src="../lessonManager.js"></script>
  <script src="../darkMode.js"></script>
  <script src="../blackoutMode.js"></script>
  <script src="../notify.js"></script>
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
  <link rel="stylesheet" href="../style.css?v=1" />
  <script src="../loader.js"></script>
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

  <div class="resources-container" data-subject-id="${subject.id}">
    <div class="welcome-message">
      <h3>Welcome to ${subject.name} Resources</h3>
      <p>Upload and organize your study materials, notes, and resources.</p>
      <p style="color: ${subject.color}; font-weight: bold;">Subject Color: ${subject.color}</p>
    </div>
  </div>

  <script src="../localStorageManager.js"></script>
  <script src="../termController.js"></script>
  <script src="../subjectManager.js"></script>
  <script src="../resourceManager.js"></script>
  <script src="../darkMode.js"></script>
  <script src="../blackoutMode.js"></script>
  <script src="../notify.js"></script>
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

  handleDynamicNavigation() {
    // This method is now handled by setupVirtualPageNavigation
    // Keeping for backward compatibility
    console.log('Dynamic navigation handler initialized');
  }

  navigateToSubjectPage(subject, pageType) {
    console.log(`Navigating to ${subject.name} ${pageType} page`);
    
    // Get current directory and ensure we stay on subjects.html
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    const newUrl = `${window.location.protocol}//${window.location.host}${directory}subjects.html#/${subject.id}/${pageType}`;
    
    console.log(`New URL will be: ${newUrl}`);
    
    // Update URL without reloading page
    window.history.pushState({ subject, pageType, fromSubjects: true }, '', newUrl);
    
    // Load the virtual page content
    this.loadDynamicPage(subject, pageType);
  }

  reinitializeScripts() {
    // Reinitialize any scripts that need to run after dynamic page load
    try {
      // Reinitialize dark mode
      if (window.DarkMode && typeof window.DarkMode.init === 'function') {
        window.DarkMode.init();
      }
      
      // Reinitialize blackout mode
      if (window.BlackoutMode && typeof window.BlackoutMode.init === 'function') {
        window.BlackoutMode.init();
      }
      
      // Reinitialize term controller
      if (window.TermController && typeof window.TermController.init === 'function') {
        window.TermController.init();
      }
      
      // Set up navigation for virtual pages
      this.setupVirtualPageNavigation();
      
      // Load existing curriculum if on curriculum page
      if (window.CURRENT_SUBJECT && document.querySelector('.curric-card')) {
        // Disable lessonManager to prevent conflicts
        if (window.LessonManager && window.LessonManager.disable) {
          window.LessonManager.disable();
        }
        
        setTimeout(() => {
          this.refreshCurriculumDisplay(window.CURRENT_SUBJECT.id);
        }, 200);
      }
      
      // Load existing resources if on resources page (check for resources in title or URL)
      if (window.CURRENT_SUBJECT && (document.title.includes('Resources') || window.location.hash.includes('resources'))) {
        // Wait longer for container to be ready and disable lesson manager
        if (window.LessonManager && window.LessonManager.disable) {
          window.LessonManager.disable();
        }
        
        setTimeout(() => {
          const container = document.querySelector('.curric-card');
          console.log('Looking for resources container:', container);
          if (container) {
            this.refreshResourcesDisplay(window.CURRENT_SUBJECT.id);
          } else {
            console.log('Container not found, retrying...');
            setTimeout(() => {
              this.refreshResourcesDisplay(window.CURRENT_SUBJECT.id);
            }, 500);
          }
        }, 300);
      }
      
    } catch (error) {
      console.error('Error reinitializing scripts:', error);
    }
  }

  setupVirtualPageNavigation() {
    // Handle back button clicks
    const backButtons = document.querySelectorAll('.back-to-subjects');
    backButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Back button clicked');
        
        // Simple approach: just go to subjects.html
        window.location.href = 'subjects.html';
      });
    });
    
    // Handle curriculum navigation
    const curriculumLinks = document.querySelectorAll('.nav-curriculum');
    curriculumLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Curriculum link clicked');
        if (window.CURRENT_SUBJECT) {
          this.navigateToSubjectPage(window.CURRENT_SUBJECT, 'curriculum');
        }
      });
    });
    
    // Handle resources navigation
    const resourcesLinks = document.querySelectorAll('.nav-resources');
    resourcesLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Resources link clicked');
        if (window.CURRENT_SUBJECT) {
          this.navigateToSubjectPage(window.CURRENT_SUBJECT, 'resources');
        }
      });
    });
    
    // Handle lesson/chapter/resource buttons
    const addButtons = document.querySelectorAll('.addlesson, .addchapter, .addresource');
    addButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        // Get current subject context
        if (window.CURRENT_SUBJECT) {
          const subject = window.CURRENT_SUBJECT;
          const buttonClass = button.className;
          
          if (buttonClass.includes('addlesson')) {
            this.handleAddLesson(subject);
          } else if (buttonClass.includes('addchapter')) {
            this.handleAddChapter(subject);
          } else if (buttonClass.includes('addresource')) {
            this.handleAddResource(subject);
          }
        } else {
          if (window.Notify) {
            Notify.info('This feature will be available soon!');
          }
        }
      });
    });
  }

  handleAddLesson(subject) {
    this.showAddLessonModal(subject);
  }

  handleAddChapter(subject) {
    this.showAddChapterModal(subject);
  }

  showAddLessonModal(subject) {
    // Create lesson modal if it doesn't exist
    if (!document.getElementById('lessonModal')) {
      this.createLessonModal();
    }
    
    const modal = document.getElementById('lessonModal');
    const form = document.getElementById('lessonForm');
    const chapterSelect = document.getElementById('lessonChapter');
    
    // Reset form
    form.reset();
    form.dataset.subjectId = subject.id;
    
    // Populate chapters
    const curriculum = LocalStorageManager.load(`curriculum_${subject.id}`) || [];
    const chapters = curriculum.filter(item => item.type === 'chapter');
    
    chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    chapters.forEach(chapter => {
      const option = document.createElement('option');
      option.value = chapter.id;
      option.textContent = chapter.title;
      chapterSelect.appendChild(option);
    });
    
    if (chapters.length === 0) {
      chapterSelect.innerHTML = '<option value="">No chapters available - create a chapter first</option>';
      chapterSelect.disabled = true;
    } else {
      chapterSelect.disabled = false;
    }
    
    // Show modal
    modal.style.display = 'block';
  }

  showAddChapterModal(subject) {
    // Create chapter modal if it doesn't exist
    if (!document.getElementById('chapterModal')) {
      this.createChapterModal();
    }
    
    const modal = document.getElementById('chapterModal');
    const form = document.getElementById('chapterForm');
    
    // Reset form
    form.reset();
    form.dataset.subjectId = subject.id;
    
    // Show modal
    modal.style.display = 'block';
  }

  createLessonModal() {
    const modal = document.createElement('div');
    modal.id = 'lessonModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Add New Lesson</h2>
        <form id="lessonForm">
          <div class="form-group">
            <label for="lessonTitle">Lesson Title:</label>
            <input type="text" id="lessonTitle" required placeholder="e.g., Introduction to Algebra">
          </div>
          <div class="form-group">
            <label for="lessonChapter">Chapter:</label>
            <select id="lessonChapter" required>
              <option value="">Select Chapter</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">Add Lesson</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupLessonModalEvents(modal);
  }

  createChapterModal() {
    const modal = document.createElement('div');
    modal.id = 'chapterModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Add New Chapter</h2>
        <form id="chapterForm">
          <div class="form-group">
            <label for="chapterTitle">Chapter Title:</label>
            <input type="text" id="chapterTitle" required placeholder="e.g., Chapter 1: Basic Concepts">
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">Add Chapter</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupChapterModalEvents(modal);
  }

  setupLessonModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = modal.querySelector('#lessonForm');
    
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLessonSubmission();
    });
  }

  setupChapterModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = modal.querySelector('#chapterForm');
    
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleChapterSubmission();
    });
  }

  handleLessonSubmission() {
    const form = document.getElementById('lessonForm');
    const subjectId = form.dataset.subjectId;
    const title = document.getElementById('lessonTitle').value.trim();
    const chapterId = document.getElementById('lessonChapter').value;
    
    if (!title) {
      if (window.Notify) Notify.error('Please enter a lesson title');
      return;
    }
    
    if (!chapterId) {
      if (window.Notify) Notify.error('Please select a chapter');
      return;
    }
    
    // Get chapter title for display
    const curriculum = LocalStorageManager.load(`curriculum_${subjectId}`) || [];
    const chapter = curriculum.find(item => item.id === chapterId);
    const chapterTitle = chapter ? chapter.title : 'Unknown Chapter';
    
    const lesson = {
      id: Date.now().toString(),
      title,
      chapterId,
      chapterTitle,
      type: 'lesson',
      mastery: 0,
      quizzesTaken: 0,
      quizzesCorrect: 0,
      created: new Date().toISOString()
    };
    
    // Save lesson
    curriculum.push(lesson);
    this.saveCurriculumToFirebase(subjectId, curriculum);
    
    // Close modal and refresh display
    document.getElementById('lessonModal').style.display = 'none';
    this.refreshCurriculumDisplay(subjectId);
    
    if (window.Notify) {
      Notify.success('Lesson added successfully!');
    }
  }

  handleChapterSubmission() {
    const form = document.getElementById('chapterForm');
    const subjectId = form.dataset.subjectId;
    const title = document.getElementById('chapterTitle').value.trim();
    
    if (!title) {
      if (window.Notify) Notify.error('Please enter a chapter title');
      return;
    }
    
    const chapter = {
      id: Date.now().toString(),
      title,
      type: 'chapter',
      mastery: 0,
      quizzesTaken: 0,
      quizzesCorrect: 0,
      created: new Date().toISOString()
    };
    
    // Save chapter
    const curriculum = LocalStorageManager.load(`curriculum_${subjectId}`) || [];
    curriculum.push(chapter);
    this.saveCurriculumToFirebase(subjectId, curriculum);
    
    // Close modal and refresh display
    document.getElementById('chapterModal').style.display = 'none';
    this.refreshCurriculumDisplay(subjectId);
    
    if (window.Notify) {
      Notify.success('Chapter added successfully!');
    }
  }

  refreshCurriculumDisplay(subjectId) {
    console.log(`Refreshing curriculum display for subject: ${subjectId}`);
    const curriculum = LocalStorageManager.load(`curriculum_${subjectId}`) || [];
    console.log(`Loaded curriculum:`, curriculum);
    
    const container = document.querySelector('.curric-card');
    
    if (container) {
      if (curriculum.length === 0) {
        container.innerHTML = '<p>No curriculum items yet. Add chapters and lessons to get started!</p>';
      } else {
        // Separate chapters and lessons
        const chapters = curriculum.filter(item => item.type === 'chapter');
        const lessons = curriculum.filter(item => item.type === 'lesson');
        
        console.log(`Found ${chapters.length} chapters and ${lessons.length} lessons`);
        
        let html = '';
        
        // Display chapters with their lessons
        chapters.forEach(chapter => {
          const chapterLessons = lessons.filter(lesson => lesson.chapterId === chapter.id);
          html += `
            <div class="curriculum-item chapter">
              <div class="item-header">
                <h4>${chapter.title}</h4>
                <div class="mastery-percentage" onclick="window.DynamicPageHandler.showMasteryModal('${chapter.id}', 'chapter', '${chapter.title}')" data-item-id="${chapter.id}">
                  ${chapter.mastery || 0}%
                </div>
              </div>
              
              <div class="chapter-lessons">
                ${chapterLessons.map(lesson => `
                  <div class="lesson-item">
                    <div class="lesson-header">
                      <h5>${lesson.title}</h5>
                      <div class="mastery-percentage lesson-mastery" onclick="window.DynamicPageHandler.showMasteryModal('${lesson.id}', 'lesson', '${lesson.title}')" data-item-id="${lesson.id}">
                        ${lesson.mastery || 0}%
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        });
        
        container.innerHTML = html;
        console.log(`Curriculum display updated with ${chapters.length} chapters`);
      }
    } else {
      console.log('Curriculum container not found');
    }
  }

  handleAddResource(subject) {
    this.showAddResourceModal(subject);
  }

  showAddResourceModal(subject) {
    // Create resource modal if it doesn't exist
    if (!document.getElementById('resourceModal')) {
      this.createResourceModal();
    }
    
    const modal = document.getElementById('resourceModal');
    const form = document.getElementById('resourceForm');
    
    // Reset form
    form.reset();
    form.dataset.subjectId = subject.id;
    
    // Show modal
    modal.style.display = 'block';
  }

  createResourceModal() {
    const modal = document.createElement('div');
    modal.id = 'resourceModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Add New Resource</h2>
        <form id="resourceForm">
          <div class="form-group">
            <label for="resourceTitle">Resource Title:</label>
            <input type="text" id="resourceTitle" required placeholder="e.g., Chapter 1 Notes">
          </div>
          
          <div class="form-group">
            <label>Resource Type:</label>
            <div class="resource-type-selector">
              <label class="radio-option">
                <input type="radio" name="resourceType" value="file" checked>
                <span>Upload File</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="resourceType" value="link">
                <span>Add Link</span>
              </label>
            </div>
          </div>
          
          <div class="form-group" id="fileUploadGroup">
            <label for="resourceFile">Select File:</label>
            <input type="file" id="resourceFile" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.mp4,.mp3">
            <div class="file-info">Supported: PDF, DOC, TXT, Images, Videos, Audio</div>
          </div>
          
          <div class="form-group" id="linkGroup" style="display: none;">
            <label for="resourceLink">Resource Link:</label>
            <input type="url" id="resourceLink" placeholder="https://example.com/resource">
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="save-btn">Add Resource</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupResourceModalEvents(modal);
  }

  setupResourceModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = modal.querySelector('#resourceForm');
    const typeRadios = modal.querySelectorAll('input[name="resourceType"]');
    const fileGroup = modal.querySelector('#fileUploadGroup');
    const linkGroup = modal.querySelector('#linkGroup');
    
    // Close modal events
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
    
    // Resource type selection
    typeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'file') {
          fileGroup.style.display = 'block';
          linkGroup.style.display = 'none';
          document.getElementById('resourceFile').required = true;
          document.getElementById('resourceLink').required = false;
        } else {
          fileGroup.style.display = 'none';
          linkGroup.style.display = 'block';
          document.getElementById('resourceFile').required = false;
          document.getElementById('resourceLink').required = true;
        }
      });
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleResourceSubmission();
    });
  }

  handleResourceSubmission() {
    const form = document.getElementById('resourceForm');
    const subjectId = form.dataset.subjectId;
    const title = document.getElementById('resourceTitle').value.trim();
    const resourceType = document.querySelector('input[name="resourceType"]:checked').value;
    
    if (!title) {
      if (window.Notify) Notify.error('Please enter a resource title');
      return;
    }
    
    let resource = {
      id: Date.now().toString(),
      title,
      type: resourceType,
      created: new Date().toISOString()
    };
    
    if (resourceType === 'file') {
      const fileInput = document.getElementById('resourceFile');
      const file = fileInput.files[0];
      
      if (!file) {
        if (window.Notify) Notify.error('Please select a file');
        return;
      }
      
      // Store file information and data for viewing
      resource.fileName = file.name;
      resource.fileSize = file.size;
      resource.fileType = file.type;
      resource.fileLastModified = file.lastModified;
      
      // Store small files (under 1MB) or create object URL for larger files
      if (file.size < 1024 * 1024) { // 1MB limit
        const reader = new FileReader();
        reader.onload = (e) => {
          resource.fileData = e.target.result;
          resource.fileStored = true;
          this.saveResource(subjectId, resource);
        };
        reader.readAsDataURL(file);
      } else {
        // For larger files, create a temporary URL
        resource.fileURL = URL.createObjectURL(file);
        resource.fileStored = true;
        resource.isLargeFile = true;
        this.saveResource(subjectId, resource);
      }
    } else {
      const link = document.getElementById('resourceLink').value.trim();
      
      if (!link) {
        if (window.Notify) Notify.error('Please enter a resource link');
        return;
      }
      
      resource.link = link;
      this.saveResource(subjectId, resource);
    }
  }

  saveResource(subjectId, resource) {
    // Save resource
    const resources = LocalStorageManager.load(`resources_${subjectId}`) || [];
    resources.push(resource);
    LocalStorageManager.save(`resources_${subjectId}`, resources);
    
    // Save to Firebase
    if (window.FirebaseManager) {
      window.FirebaseManager.queueForSync('resources', {
        subjectId: subjectId,
        data: resources,
        timestamp: new Date().toISOString()
      });
    }
    
    // Close modal and refresh display
    document.getElementById('resourceModal').style.display = 'none';
    
    // Add delay to ensure content isn't overridden
    setTimeout(() => {
      this.refreshResourcesDisplay(subjectId);
    }, 100);
    
    if (window.Notify) {
      Notify.success('Resource added successfully!');
    }
  }

  refreshResourcesDisplay(subjectId) {
    const resources = LocalStorageManager.load(`resources_${subjectId}`) || [];
    
    console.log(`Refreshing resources display for subject: ${subjectId}`);
    console.log(`Found ${resources.length} resources`);
    
    // Wait for DOM to be fully ready, then find the correct container
    setTimeout(() => {
      let container = document.querySelector('.curric-card');
      
      console.log('All .curric-card elements:', document.querySelectorAll('.curric-card'));
      console.log('Container found:', container);
      console.log('Container HTML:', container ? container.outerHTML : 'null');
      
      if (!container) {
        console.log('Creating container since none found');
        // Create the container if it doesn't exist
        const cardHeader = document.querySelector('.card-header');
        if (cardHeader) {
          container = document.createElement('div');
          container.className = 'curric-card';
          container.setAttribute('data-subject-id', subjectId);
          cardHeader.parentNode.insertBefore(container, cardHeader.nextSibling);
        }
      }
    
      if (container) {
        // Mark container as showing resources to prevent overwrites
        container.setAttribute('data-showing', 'resources');
        container.setAttribute('data-subject-id', subjectId);
        
        if (resources.length === 0) {
          container.innerHTML = '<p>No resources yet. Add resources to get started!</p>';
        } else {
          container.innerHTML = resources.map(resource => `
            <div class="resource-item ${resource.type}">
              <div class="resource-header">
                <h4>${resource.title}</h4>
                <div class="resource-type-badge ${resource.type}">
                  ${resource.type === 'file' ? '📁' : '🔗'} ${resource.type.toUpperCase()}
                </div>
              </div>
              <div class="resource-content">
                ${resource.type === 'file' ? `
                  <div class="file-info">
                    <span class="file-name">${resource.fileName}</span>
                    <span class="file-size">${this.formatFileSize(resource.fileSize)}</span>
                  </div>
                  <button class="view-file-btn" onclick="window.DynamicPageHandler.downloadFile('${resource.id}', '${subjectId}')">
                    Download File
                  </button>
                ` : `
                  <div class="link-info">
                    <a href="${resource.link}" target="_blank" class="resource-link-btn">
                      Open Link
                    </a>
                  </div>
                `}
              </div>
              <div class="resource-actions">
                <button class="delete-resource-btn" onclick="window.DynamicPageHandler.deleteResource('${resource.id}', '${subjectId}')">
                  🗑️
                </button>
              </div>
            </div>
          `).join('');
        }
        console.log('Resources display updated in correct container');
      } else {
        console.log('Could not find or create resources container');
      }
    }, 100);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  downloadFile(resourceId, subjectId) {
    const resources = LocalStorageManager.load(`resources_${subjectId}`) || [];
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource) {
      if (resource.fileData) {
        // Download small file from base64 data
        this.downloadFromData(resource.fileData, resource.fileName);
      } else if (resource.fileURL) {
        // Download large file using object URL
        const a = document.createElement('a');
        a.href = resource.fileURL;
        a.download = resource.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fallback for files without stored data
        if (window.Notify) {
          Notify.info(`File: ${resource.fileName} (${this.formatFileSize(resource.fileSize)}) - File needs to be re-uploaded for download`);
        }
      }
    }
  }

  downloadFromData(dataUrl, filename) {
    // Convert base64 data URL to downloadable file
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  deleteResource(resourceId, subjectId) {
    if (confirm('Are you sure you want to delete this resource?')) {
      const resources = LocalStorageManager.load(`resources_${subjectId}`) || [];
      const updatedResources = resources.filter(r => r.id !== resourceId);
      
      LocalStorageManager.save(`resources_${subjectId}`, updatedResources);
      
      // Update Firebase
      if (window.FirebaseManager) {
        window.FirebaseManager.queueForSync('resources', {
          subjectId: subjectId,
          data: updatedResources,
          timestamp: new Date().toISOString()
        });
      }
      
      this.refreshResourcesDisplay(subjectId);
      
      if (window.Notify) {
        Notify.success('Resource deleted successfully!');
      }
    }
  }

  // Firebase saving function
  saveCurriculumToFirebase(subjectId, curriculum) {
    // Save to localStorage first (immediate)
    LocalStorageManager.save(`curriculum_${subjectId}`, curriculum);
    
    console.log(`Saved curriculum for ${subjectId}:`, curriculum);
    
    // Queue for Firebase sync if available
    if (window.FirebaseManager) {
      window.FirebaseManager.queueForSync('curriculum', {
        subjectId: subjectId,
        data: curriculum,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Show mastery modal with quiz statistics
  showMasteryModal(itemId, itemType, itemTitle) {
    // Create mastery modal if it doesn't exist
    if (!document.getElementById('masteryModal')) {
      this.createMasteryModal();
    }
    
    const modal = document.getElementById('masteryModal');
    const titleElement = document.getElementById('masteryTitle');
    const statsContainer = document.getElementById('masteryStats');
    
    // Get current subject curriculum
    const subjectId = window.CURRENT_SUBJECT?.id;
    if (!subjectId) return;
    
    const curriculum = LocalStorageManager.load(`curriculum_${subjectId}`) || [];
    const item = curriculum.find(i => i.id === itemId);
    
    if (!item) return;
    
    // Update modal content
    titleElement.textContent = `${itemTitle} - Mastery Progress`;
    
    const quizzesTaken = item.quizzesTaken || 0;
    const quizzesCorrect = item.quizzesCorrect || 0;
    const mastery = item.mastery || 0;
    
    statsContainer.innerHTML = `
      <div class="mastery-stat">
        <div class="stat-number">${mastery}%</div>
        <div class="stat-label">Mastery Level</div>
      </div>
      <div class="mastery-stat">
        <div class="stat-number">${quizzesTaken}</div>
        <div class="stat-label">Quizzes Taken</div>
      </div>
      <div class="mastery-stat">
        <div class="stat-number">${quizzesCorrect}</div>
        <div class="stat-label">Correct Answers</div>
      </div>
      <div class="mastery-stat">
        <div class="stat-number">${quizzesTaken > 0 ? Math.round((quizzesCorrect / quizzesTaken) * 100) : 0}%</div>
        <div class="stat-label">Success Rate</div>
      </div>
    `;
    
    // Show modal
    modal.style.display = 'block';
  }

  createMasteryModal() {
    const modal = document.createElement('div');
    modal.id = 'masteryModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content mastery-modal-content">
        <span class="close-btn">&times;</span>
        <h2 id="masteryTitle">Mastery Progress</h2>
        <div id="masteryStats" class="mastery-stats-grid">
          <!-- Stats will be populated here -->
        </div>
        <div class="modal-actions">
          <button type="button" class="practice-btn">Practice Quiz</button>
          <button type="button" class="close-modal-btn">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.setupMasteryModalEvents(modal);
  }

  setupMasteryModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    const practiceBtn = modal.querySelector('.practice-btn');
    
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
    
    practiceBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      if (window.Notify) {
        Notify.info('Quiz practice feature coming soon!');
      }
    });
  }

  redirectToSubjects() {
    window.location.href = 'subjects.html';
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '43, 93, 138';
  }
}

// Initialize dynamic page handler
window.DynamicPageHandler = new DynamicPageHandler();

// Handle browser back/forward buttons and hash changes
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.subject && e.state.pageType) {
    window.DynamicPageHandler.loadDynamicPage(e.state.subject, e.state.pageType);
  }
});

// Handle hash changes for virtual page navigation
window.addEventListener('hashchange', () => {
  if (window.DynamicPageHandler) {
    window.DynamicPageHandler.handleMissingSubjectPages();
  }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.subject && e.state.pageType) {
    window.DynamicPageHandler.loadDynamicPage(e.state.subject, e.state.pageType);
  } else if (e.state && e.state.fromSubjects) {
    // If we came from subjects page, go back to subjects
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    const subjectsUrl = `${window.location.protocol}//${window.location.host}${directory}subjects.html`;
    window.location.href = subjectsUrl;
  } else if (window.location.hash) {
    // Handle hash-based navigation
    window.DynamicPageHandler.handleMissingSubjectPages();
  } else {
    // Default: go back to subjects page
    const currentPath = window.location.pathname;
    const directory = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
    const subjectsUrl = `${window.location.protocol}//${window.location.host}${directory}subjects.html`;
    window.location.href = subjectsUrl;
  }
});

// Handle initial hash on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash && window.DynamicPageHandler) {
    setTimeout(() => {
      window.DynamicPageHandler.handleMissingSubjectPages();
    }, 100);
  }
});
