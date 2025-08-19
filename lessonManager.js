class LessonManager {
  static init() {
    console.log('LessonManager initializing...');
    
    // Check if we're on a page that needs lesson management
    const hasCurriculumCard = document.querySelector('.curric-card');
    
    console.log('Found elements:', { hasCurriculumCard: !!hasCurriculumCard });
    
    if (!hasCurriculumCard) {
      console.log('No lesson management elements found, skipping initialization');
      return;
    }
    
    try {
      // Clean up any existing data with wrong subjects
      this.cleanupSubjectData();
      
      // Debug localStorage first
      this.debugLocalStorage();
      
      // Load lessons immediately
      this.loadLessons();
      this.setupEventListeners();
      console.log('LessonManager initialized successfully');
      
      // Also load lessons after a short delay to ensure DOM is ready
      setTimeout(() => {
        console.log('Reloading lessons after delay...');
        this.loadLessons();
      }, 100);
    } catch (error) {
      console.error('Error initializing LessonManager:', error);
    }
  }

  static setupEventListeners() {
    // Add Chapter button
    const addChapterBtn = document.querySelector('.addchapter');
    if (addChapterBtn) {
      addChapterBtn.addEventListener('click', () => this.showAddChapterModal());
    }

    // Add Lesson button
    const addLessonBtn = document.querySelector('.addlesson');
    if (addLessonBtn) {
      addLessonBtn.addEventListener('click', () => this.showAddLessonModal());
    }

    // Add Resource button
    const addResourceBtn = document.querySelector('.addresource');
    if (addResourceBtn) {
      addResourceBtn.addEventListener('click', () => this.showAddResourceModal());
    }
  }

  static showAddChapterModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addChapterModal';
    
    const currentSubject = this.getCurrentSubject();
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Add New Chapter</h2>
        <form class="chapter-form">
          <div class="form-group">
            <label>Chapter Title:</label>
            <input type="text" id="chapterTitle" placeholder="e.g. Chapter 1: Introduction" required />
          </div>
          <div class="form-group">
            <label>Subject:</label>
            <input type="text" id="chapterSubject" value="${currentSubject}" readonly />
            <small>Subject is automatically set to current page</small>
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">Add Chapter</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Add event listeners
    const form = modal.querySelector('.chapter-form');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addChapter();
    });
    
    closeBtn.onclick = () => this.closeModal('addChapterModal');
    cancelBtn.onclick = () => this.closeModal('addChapterModal');
    
    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal('addChapterModal');
    };
  }

  static showAddLessonModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addLessonModal';
    
    const currentSubject = this.getCurrentSubject();
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Add New Lesson</h2>
        <form class="lesson-form">
          <div class="form-group">
            <label>Lesson Title:</label>
            <input type="text" id="lessonTitle" placeholder="e.g. 1.1 Introduction to Fractions" required />
          </div>
          <div class="form-group">
            <label>Chapter:</label>
            <select id="lessonChapter" required>
              <option value="">Select Chapter</option>
              ${this.getChapterOptions()}
            </select>
          </div>
          <div class="form-group">
            <label>Subject:</label>
            <input type="text" id="lessonSubject" value="${currentSubject}" readonly />
            <small>Subject is automatically set to current page</small>
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">Add Lesson</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Add event listeners
    const form = modal.querySelector('.lesson-form');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addLesson();
    });
    
    closeBtn.onclick = () => this.closeModal('addLessonModal');
    cancelBtn.onclick = () => this.closeModal('addLessonModal');
    
    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal('addLessonModal');
    };
  }

  static showAddResourceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'addResourceModal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Add New Resource</h2>
        <form class="resource-form">
          <div class="form-group">
            <label>Resource Title:</label>
            <input type="text" id="resourceTitle" placeholder="e.g. Fraction Worksheet" required />
          </div>
          <div class="form-group">
            <label>Resource Type:</label>
            <select id="resourceType" required>
              <option value="">Select Type</option>
              <option value="link">Link/URL</option>
              <option value="file">File Upload</option>
            </select>
          </div>
          <div class="form-group" id="urlGroup">
            <label>URL/Link:</label>
            <input type="url" id="resourceUrl" placeholder="https://..." />
          </div>
          <div class="form-group" id="fileGroup" style="display: none;">
            <label>File:</label>
            <input type="file" id="resourceFile" accept="*/*" />
            <small>Supported formats: PDF, DOC, DOCX, TXT, Images, etc.</small>
          </div>
          <div class="form-group">
            <label>Subject:</label>
            <input type="text" id="resourceSubject" value="${this.getCurrentSubject()}" readonly />
            <small>Subject is automatically set to current page</small>
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">Add Resource</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    
    // Add event listeners
    const form = modal.querySelector('.resource-form');
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const resourceTypeSelect = modal.querySelector('#resourceType');
    const urlGroup = modal.querySelector('#urlGroup');
    const fileGroup = modal.querySelector('#fileGroup');
    const urlInput = modal.querySelector('#resourceUrl');
    const fileInput = modal.querySelector('#resourceFile');
    
    // Handle resource type change
    resourceTypeSelect.addEventListener('change', () => {
      if (resourceTypeSelect.value === 'file') {
        urlGroup.style.display = 'none';
        fileGroup.style.display = 'block';
        urlInput.removeAttribute('required');
        fileInput.setAttribute('required', 'required');
      } else {
        urlGroup.style.display = 'block';
        fileGroup.style.display = 'none';
        urlInput.setAttribute('required', 'required');
        fileInput.removeAttribute('required');
      }
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addResource();
    });
    
    closeBtn.onclick = () => this.closeModal('addResourceModal');
    cancelBtn.onclick = () => this.closeModal('addResourceModal');
    
    modal.onclick = (e) => {
      if (e.target === modal) this.closeModal('addResourceModal');
    };
  }

  static addChapter() {
    const title = document.getElementById('chapterTitle').value;
    
    if (!title) {
      try { Notify && Notify.warn('Please fill in the chapter title'); } catch(e) {}
      return;
    }
    
    // Automatically set subject to current page subject
    const subject = this.getCurrentSubject();
    
    const chapter = {
      id: Date.now().toString(),
      title: title,
      subject: subject,
      lessons: [],
      createdAt: new Date().toISOString()
    };
    
    const chapters = this.loadChapters();
    chapters.push(chapter);
    this.saveChapters(chapters);
    
    this.closeModal('addChapterModal');
    this.loadLessons();
    try { Notify && Notify.success('Chapter added'); } catch(e) {}
  }

  static addLesson() {
    const title = document.getElementById('lessonTitle').value;
    const chapterId = document.getElementById('lessonChapter').value;
    
    if (!title || !chapterId) {
      try { Notify && Notify.warn('Please fill in all fields'); } catch(e) {}
      return;
    }
    
    // Automatically set subject to current page subject
    const subject = this.getCurrentSubject();
    
    const lesson = {
      id: Date.now().toString(),
      title: title,
      chapterId: chapterId,
      subject: subject,
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    const chapters = this.loadChapters();
    const chapterIndex = chapters.findIndex(c => c.id === chapterId);
    
    if (chapterIndex !== -1) {
      chapters[chapterIndex].lessons.push(lesson);
      this.saveChapters(chapters);
      
      this.closeModal('addLessonModal');
      this.loadLessons();
      try { Notify && Notify.success('Lesson added'); } catch(e) {}
    } else {
      try { Notify && Notify.error('Chapter not found'); } catch(e) {}
    }
  }

  static addResource() {
    const title = document.getElementById('resourceTitle').value;
    const resourceType = document.getElementById('resourceType').value;
    const subject = document.getElementById('resourceSubject').value;
    
    if (!title || !resourceType) {
      try { Notify && Notify.warn('Please fill in all fields'); } catch(e) {}
      return;
    }
    
    let resource = {
      id: Date.now().toString(),
      title: title,
      type: resourceType,
      subject: subject,
      createdAt: new Date().toISOString()
    };
    
    // Handle different resource types
    if (resourceType === 'file') {
      const fileInput = document.getElementById('resourceFile');
      if (!fileInput.files[0]) {
        try { Notify && Notify.warn('Please select a file'); } catch(e) {}
        return;
      }
      const file = fileInput.files[0];
      resource.file = {
        name: file.name,
        size: file.size,
        type: file.type,
        data: null // Will be converted to base64
      };
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        resource.file.data = e.target.result;
        this.saveResourceToStorage(resource);
      };
      reader.readAsDataURL(file);
    } else {
      // Link-based resource
      const url = document.getElementById('resourceUrl').value;
      if (!url) {
        try { Notify && Notify.warn('Please enter a URL'); } catch(e) {}
        return;
      }
      resource.url = url;
      this.saveResourceToStorage(resource);
    }
  }
  
  static saveResourceToStorage(resource) {
    const resources = this.loadResourcesData();
    resources.push(resource);
    this.saveResources(resources);
    
    this.closeModal('addResourceModal');
    this.loadLessons(); // This will detect if we're on resources page and render appropriately
    try { Notify && Notify.success('Resource added'); } catch(e) {}
  }
  
  static downloadResource(resourceId) {
    const resources = this.loadResourcesData();
    const resource = resources.find(r => r.id === resourceId);
    
    if (resource && resource.file) {
      // Create download link for file
      const link = document.createElement('a');
      link.href = resource.file.data;
      link.download = resource.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static getChapterOptions() {
    const chapters = this.loadChapters();
    const currentSubject = this.getCurrentSubject();
    
    // Filter chapters by current subject
    const subjectChapters = chapters.filter(chapter => 
      chapter.subject.toLowerCase() === currentSubject.toLowerCase()
    );
    
    return subjectChapters.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
  }

  static loadChapters() {
    return LocalStorageManager.load('chapters') || [];
  }

  static saveChapters(chapters) {
    LocalStorageManager.save('chapters', chapters);
  }

  static loadLessons() {
    console.log('Loading lessons...');
    try {
      // Check if we're on a resources page
      const isResourcesPage = window.location.pathname.includes('resources.html');
      
      if (isResourcesPage) {
        console.log('Detected resources page, loading resources...');
        const resources = this.loadResourcesData();
        this.renderResources(resources);
      } else {
        console.log('Detected curriculum page, loading chapters...');
        const chapters = this.loadChapters();
        console.log(`Found ${chapters.length} chapters:`, chapters);
        
        // Get current subject and filter chapters BEFORE rendering
        const currentSubject = this.getCurrentSubject();
        console.log('Current subject for curriculum page:', currentSubject);
        
        // Log all chapters before filtering
        console.log('All chapters before filtering:', chapters.map(c => ({ title: c.title, subject: c.subject })));
        
        // Filter chapters by current subject (same logic as resources)
        const subjectChapters = chapters.filter(chapter => {
          const matches = chapter.subject.toLowerCase() === currentSubject.toLowerCase();
          console.log(`Chapter "${chapter.title}" (subject: "${chapter.subject}") matches "${currentSubject}": ${matches}`);
          return matches;
        });
        console.log(`Filtered chapters for ${currentSubject}:`, subjectChapters);
        
        // Log each filtered chapter and its lessons
        subjectChapters.forEach((chapter, index) => {
          console.log(`Chapter ${index + 1}:`, chapter.title, 'has lessons:', chapter.lessons ? chapter.lessons.length : 0);
          if (chapter.lessons) {
            chapter.lessons.forEach((lesson, lessonIndex) => {
              console.log(`  Lesson ${lessonIndex + 1}:`, lesson.title, 'Subject:', lesson.subject);
            });
          }
        });
        
        this.renderChapters(subjectChapters); // Pass filtered chapters
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  }

  static loadResources() {
    const resources = this.loadResourcesData();
    this.renderResources(resources);
  }

  static loadResourcesData() {
    return LocalStorageManager.load('resources') || [];
  }

  static saveResources(resources) {
    LocalStorageManager.save('resources', resources);
  }

  // Get all lessons for quiz selection
  static getAllLessons() {
    const chapters = this.loadChapters();
    const allLessons = [];
    
    chapters.forEach(chapter => {
      if (chapter.lessons && chapter.lessons.length > 0) {
        chapter.lessons.forEach(lesson => {
          allLessons.push({
            ...lesson,
            chapterTitle: chapter.title
          });
        });
      }
    });
    
    console.log('getAllLessons returning:', allLessons);
    return allLessons;
  }

  // Debug method to check localStorage data
  static debugLocalStorage() {
    console.log('=== LocalStorage Debug ===');
    const chapters = this.loadChapters();
    console.log('Chapters in localStorage:', chapters);
    
    const resources = this.loadResourcesData();
    console.log('Resources in localStorage:', resources);
    
    // Check raw localStorage
    console.log('Raw localStorage chapters:', localStorage.getItem('chapters'));
    console.log('Raw localStorage resources:', localStorage.getItem('resources'));
  }

    static renderChapters(chapters) {
    console.log('Rendering chapters...');
    try {
      // Debug: Check what elements exist in the DOM
      console.log('=== DOM Debug ===');
      console.log('All elements with class "add-group":', document.querySelectorAll('.add-group'));
      console.log('All elements with class "curric-card":', document.querySelectorAll('.curric-card'));
      console.log('Document body children:', document.body.children);
      
      const container = document.querySelector('.curric-card');
      if (!container) {
        console.log('No container found for chapters');
        return;
      }
      
      console.log('Container found:', container.className);
      console.log('Container children:', container.children);
      
      // Clear container fully (header is outside the card)
      container.innerHTML = '';

      // Chapters are already filtered by subject from loadLessons()
      console.log('Chapters to render (already filtered by subject):', chapters);
      chapters.forEach((chapter, index) => {
        console.log(`Chapter ${index}: "${chapter.title}" - Subject: "${chapter.subject}"`);
      });
      
      console.log(`Rendering ${chapters.length} chapters...`);

      if (chapters.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No lessons yet';
        container.appendChild(empty);
        return;
      }

      // Render chapters and lessons
      chapters.forEach((chapter, index) => {
        const chapterDiv = document.createElement('div');
        chapterDiv.className = 'chapter';
        chapterDiv.innerHTML = `<h2>${chapter.title}</h2>`;
        container.appendChild(chapterDiv);

        if (chapter.lessons && chapter.lessons.length > 0) {
          chapter.lessons.forEach(lesson => {
            const lessonDiv = document.createElement('div');
            lessonDiv.className = 'lesson';
            const subject = this.getCurrentSubject();
            const mastery = this.updateLessonMastery(subject, lesson.id, lesson.progress ?? 0);
            const colorClass = mastery >= 100 ? 'progress-green' : (mastery > 0 ? 'progress-yellow' : 'progress-red');
            lessonDiv.innerHTML = `
              <h3>${lesson.title}</h3>
              <div class="button-group">
                <h3 class="progress-chip ${colorClass}" data-lesson-id="${lesson.id}">${mastery}%</h3>
              </div>
            `;
            // apply lesson-level class for background/border state
            lessonDiv.classList.add(mastery >= 100 ? 'mastery-complete' : (mastery > 0 ? 'mastery-partial' : 'mastery-none'));
            chapterDiv.appendChild(lessonDiv);
            const chip = lessonDiv.querySelector('.progress-chip');
            chip?.addEventListener('click', (e)=>{
              e.preventDefault(); e.stopPropagation();
              this.showLessonQuizModal(subject, lesson.id, lesson.title);
            });
          });
        }
      });
      
      console.log('Chapters rendered successfully');
    } catch (error) {
      console.error('Error rendering chapters:', error);
    }
  }

  static updateLessonMastery(subject, lessonId, fallback=0) {
    const quizzes = LocalStorageManager.getLessonQuizzes(subject, lessonId);
    // mastery is floor(total quiz percent / 10), clamped to 100
    const totalPct = quizzes.reduce((acc, q)=>{
      const out = Number(q.outOf)||0; const sc = Number(q.score)||0;
      return acc + (out > 0 ? (sc/out)*100 : 0);
    }, 0);
    const mastery = Math.max(0, Math.min(100, Math.floor(totalPct / 10)));
    const chapters = this.loadChapters();
    let changed = false;
    chapters.forEach(ch=>{ (ch.lessons||[]).forEach(ls=>{ if (ls.id === lessonId) { if (ls.progress !== mastery) { ls.progress = mastery; changed = true; } } }); });
    if (changed) this.saveChapters(chapters);
    return (quizzes.length ? mastery : (fallback||0));
  }

  static showLessonQuizModal(subject, lessonId, lessonTitle) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'lessonQuizModal';
    const quizzes = LocalStorageManager.getLessonQuizzes(subject, lessonId);
    const grid = quizzes.length ? quizzes.map((q)=>{ const pct=Math.round((q.score/q.outOf)*100); const ringClass = pct>=80? 'ring-green' : (pct>=40? 'ring-yellow' : 'ring-red'); const date=q.date? new Date(q.date).toLocaleDateString():''; return `<div class=\"quiz-card\"><div class=\"quiz-ring ${ringClass}\" style=\"--pct:${pct}\">${pct}%</div><div class=\"quiz-meta\"><div class=\"quiz-score\">${q.score}/${q.outOf}</div><div class=\"quiz-date\">${date}</div></div></div>`; }).join('') : '<div class="quiz-card"><div class="quiz-title">No quizzes yet</div></div>';
    const mastery = this.updateLessonMastery(subject, lessonId, 0);
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-btn">&times;</span>
        <h2>Lesson Mastery</h2>
        <p><strong>${lessonTitle}</strong></p>
        <p>Mastery: <strong id="masteryVal">${mastery}%</strong></p>
        <ul class="quiz-list"></ul>
        <div class="quiz-grid">${grid}</div>
        <form class="quiz-add-form" style="margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <label>Score <input type="number" id="quizScore" min="0" value="10" style="width:80px;"/></label>
          <label>Out of <input type="number" id="quizOutOf" min="1" value="10" style="width:80px;"/></label>
          <button type="submit" class="save-btn">Add</button>
        </form>
      </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    const close = ()=> modal.remove();
    modal.querySelector('.close-btn')?.addEventListener('click', close);
    // Only close via X button
    modal.querySelector('.quiz-add-form')?.addEventListener('submit', (e)=>{
      e.preventDefault(); e.stopPropagation();
      const sc = Math.max(0, Number(modal.querySelector('#quizScore').value||0));
      const out = Math.max(1, Number(modal.querySelector('#quizOutOf').value||10));
      LocalStorageManager.addLessonQuiz(subject, lessonId, sc, out);
      try { Notify && Notify.success('Quiz result added'); } catch(_) {}
      const qs = LocalStorageManager.getLessonQuizzes(subject, lessonId);
      modal.querySelector('.quiz-grid').innerHTML = qs.map((q)=>{ const pct=Math.round((q.score/q.outOf)*100); const ringClass = pct>=80? 'ring-green' : (pct>=40? 'ring-yellow' : 'ring-red'); const date=q.date? new Date(q.date).toLocaleDateString():''; return `<div class=\\\"quiz-card\\\"><div class=\\\"quiz-ring ${ringClass}\\\" style=\\\"--pct:${pct}\\\">${pct}%</div><div class=\\\"quiz-meta\\\"><div class=\\\"quiz-score\\\">${q.score}/${q.outOf}</div><div class=\\\"quiz-date\\\">${date}</div></div></div>`; }).join('');
      const m = this.updateLessonMastery(subject, lessonId, 0);
      modal.querySelector('#masteryVal').textContent = `${m}%`;
      document.querySelectorAll(`.progress-chip[data-lesson-id='${lessonId}']`).forEach(el=>{
        el.textContent = `${m}%`;
        el.classList.remove('progress-red','progress-yellow','progress-green');
        el.classList.add(m>=100?'progress-green':(m>0?'progress-yellow':'progress-red'));
        const parent = el.closest('.lesson');
        if (parent){
          parent.classList.remove('mastery-none','mastery-partial','mastery-complete');
          parent.classList.add(m>=100?'mastery-complete':(m>0?'mastery-partial':'mastery-none'));
        }
      });
      if (m >= 100) {
        try { Notify && Notify.success('Mastery complete!'); } catch(_){ }
        this.launchConfetti();
      }
    });
  }

  static launchConfetti(){
    const colors = ['#e91e63','#9c27b0','#3f51b5','#03a9f4','#4caf50','#ff9800','#f44336'];
    const n = 140;
    for (let i=0;i<n;i++){
      const s = document.createElement('span');
      s.className = 'confetti-piece';
      s.style.left = Math.random()*100 + 'vw';
      s.style.background = colors[Math.floor(Math.random()*colors.length)];
      s.style.animation = `confettiFall ${1400 + Math.random()*1600}ms ease-out forwards`;
      s.style.transform = `translateY(${Math.random()*-100}px)`;
      document.body.appendChild(s);
      setTimeout(()=> s.remove(), 3200);
    }
  }

  static renderResources(resources) {
    const container = document.querySelector('.curric-card');
    if (!container) return;
    
    console.log('Rendering resources in container:', container);
    console.log('Resources to render:', resources);
    
    // Clear container fully (header is outside)
    container.innerHTML = '';

    // Get current subject and filter resources
    const currentSubject = this.getCurrentSubject();
    const subjectResources = resources.filter(resource => 
      resource.subject.toLowerCase() === currentSubject.toLowerCase()
    );
    console.log(`Filtered resources for ${currentSubject}:`, subjectResources);
    
    if (subjectResources.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No resources yet';
      container.appendChild(empty);
      return;
    }

    // Render resources
    subjectResources.forEach((resource, index) => {
      const resourceDiv = document.createElement('div');
      resourceDiv.className = 'resource-item';
      
      // Check if resource has a file or just a link
      const resourceContent = resource.file ? 
        `<p><strong>File:</strong> ${resource.file.name}</p>` :
        `<p><strong>Type:</strong> ${resource.type}</p>`;
      
      resourceDiv.innerHTML = `
        <h4>${resource.title}</h4>
        ${resourceContent}
        <p><strong>Subject:</strong> ${resource.subject}</p>
        ${resource.file ? 
          `<button class="download-btn" onclick="LessonManager.downloadResource('${resource.id}')">Download File</button>` :
          `<a href="${resource.url}" target="_blank" class="resource-link">View Resource</a>`
        }
      `;
      container.appendChild(resourceDiv);
    });
    
    console.log('Resources rendered successfully');
  }

  static updateLessonProgress(lessonId, progress) {
    const chapters = this.loadChapters();
    let updated = false;
    
    chapters.forEach(chapter => {
      chapter.lessons.forEach(lesson => {
        if (lesson.id === lessonId) {
          lesson.progress = progress;
          updated = true;
        }
      });
    });
    
    if (updated) {
      this.saveChapters(chapters);
    }
  }

  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }

  static getCurrentSubject() {
    // Get subject from page title
    const pageTitle = document.title;
    console.log('Page title:', pageTitle);
    
    // Check page title first
    if (pageTitle.includes('Mathematics')) {
      console.log('Subject detected from title: Mathematics');
      return 'Mathematics';
    }
    if (pageTitle.includes('Physics')) {
      console.log('Subject detected from title: Physics');
      return 'Physics';
    }
    if (pageTitle.includes('Chemistry')) {
      console.log('Subject detected from title: Chemistry');
      return 'Chemistry';
    }
    if (pageTitle.includes('Biology')) {
      console.log('Subject detected from title: Biology');
      return 'Biology';
    }
    if (pageTitle.includes('English')) {
      console.log('Subject detected from title: English');
      return 'English';
    }
    if (pageTitle.includes('Arabic')) {
      console.log('Subject detected from title: Arabic');
      return 'Arabic';
    }
    if (pageTitle.includes('Business')) {
      console.log('Subject detected from title: Business');
      return 'Business';
    }
    
    // Fallback to URL path
    const path = window.location.pathname;
    console.log('URL path:', path);
    
    if (path.includes('/math/')) {
      console.log('Subject detected from URL: Mathematics');
      return 'Mathematics';
    }
    if (path.includes('/physics/')) {
      console.log('Subject detected from URL: Physics');
      return 'Physics';
    }
    if (path.includes('/chemistry/')) {
      console.log('Subject detected from URL: Chemistry');
      return 'Chemistry';
    }
    if (path.includes('/biology/')) {
      console.log('Subject detected from URL: Biology');
      return 'Biology';
    }
    if (path.includes('/english/')) {
      console.log('Subject detected from URL: English');
      return 'English';
    }
    if (path.includes('/arabic/')) {
      console.log('Subject detected from URL: Arabic');
      return 'Arabic';
    }
    if (path.includes('/business/')) {
      console.log('Subject detected from URL: Business');
      return 'Business';
    }
    
    console.log('Could not determine subject, returning Unknown');
    return 'Unknown';
  }

  static getLessonsForSubject(subject) {
    const chapters = this.loadChapters();
    const lessons = [];
    
    chapters.forEach(chapter => {
      if (chapter.subject.toLowerCase() === subject.toLowerCase()) {
        chapter.lessons.forEach(lesson => {
          lessons.push({
            ...lesson,
            chapterTitle: chapter.title
          });
        });
      }
    });
    
    return lessons;
  }

    // Clean up any existing data with wrong subjects
  static cleanupSubjectData() {
    console.log('Cleaning up subject data...');
    const chapters = this.loadChapters();
    const resources = this.loadResourcesData();
    
    // Get current subject
    const currentSubject = this.getCurrentSubject();
    console.log('Current subject for cleanup:', currentSubject);
    
    // Log what we found
    console.log('All chapters found:', chapters.map(c => ({ title: c.title, subject: c.subject })));
    console.log('All resources found:', resources.map(r => ({ title: r.title, subject: r.subject })));
    
    // Don't modify the data - just log what we found
    // The filtering will happen in loadLessons() and renderChapters()
    console.log('Cleanup complete - data will be filtered for display only');
  }


}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing LessonManager...');
  
  // Add a timeout to prevent infinite loading
  const timeout = setTimeout(() => {
    console.error('LessonManager initialization timed out');
  }, 5000); // 5 second timeout
  
  try {
    LessonManager.init();
    clearTimeout(timeout);
  } catch (error) {
    console.error('Error during LessonManager initialization:', error);
    clearTimeout(timeout);
  }
});

// Make it globally available
window.LessonManager = LessonManager;
