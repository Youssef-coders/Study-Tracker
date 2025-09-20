// AI Quiz Generator Tool
class AIQuizTool {
  constructor() {
    this.currentStep = 1;
    this.selectedSubject = null;
    this.selectedChapters = [];
    this.selectedLessons = [];
    this.quizData = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupQuizTool());
    } else {
      this.setupQuizTool();
    }
  }

  setupQuizTool() {
    console.log('Setting up AI Quiz Tool...');
    console.log('SubjectManager available:', !!window.SubjectManager);
    
    this.loadSubjects();
    this.setupEventListeners();
    this.updateStepVisibility();
  }

  loadSubjects() {
    console.log('loadSubjects called');
    
    // Try multiple times to ensure SubjectManager is ready
    let attempts = 0;
    const tryLoad = () => {
      attempts++;
      console.log(`Load attempt ${attempts}`);
      
      const subjects = window.SubjectManager ? window.SubjectManager.getSubjects() : [];
      const container = document.getElementById('subjectSelector');
      
      console.log('SubjectManager:', window.SubjectManager);
      console.log('Subjects found:', subjects);
      console.log('Container found:', container);
      
      if (container) {
        if (subjects && subjects.length > 0) {
          console.log('Rendering subjects...');
          container.innerHTML = subjects.map(subject => `
            <div class="subject-option" data-subject-id="${subject.id}" style="border-color: ${subject.color}">
              <div class="subject-color" style="background-color: ${subject.color}"></div>
              <span class="subject-name">${subject.name}</span>
            </div>
          `).join('');
          
          // Add click handlers
          container.querySelectorAll('.subject-option').forEach(option => {
            option.addEventListener('click', () => {
              console.log('Subject clicked:', option.dataset.subjectId);
              this.selectSubject(option.dataset.subjectId);
            });
          });
          
          console.log('Subjects rendered successfully');
        } else {
          if (attempts < 5) {
            console.log('No subjects yet, retrying...');
            setTimeout(tryLoad, 500);
          } else {
            container.innerHTML = '<p>No subjects available. Please create subjects first by going to the Subjects page.</p>';
          }
        }
      } else {
        console.log('Container not found');
      }
    };
    
    tryLoad();
  }

  selectSubject(subjectId) {
    this.selectedSubject = window.SubjectManager.getSubject(subjectId);
    
    // Update UI
    document.querySelectorAll('.subject-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`[data-subject-id="${subjectId}"]`).classList.add('selected');
    
    // Load chapters for this subject
    this.loadChapters();
    
    // Show next button
    document.getElementById('nextBtn').style.display = 'inline-block';
  }

  loadChapters() {
    if (!this.selectedSubject) return;
    
    const curriculum = LocalStorageManager.load(`curriculum_${this.selectedSubject.id}`) || [];
    const chapters = curriculum.filter(item => item.type === 'chapter');
    const container = document.getElementById('chapterSelector');
    
    if (chapters.length > 0) {
      container.innerHTML = chapters.map(chapter => `
        <label class="selection-item">
          <input type="checkbox" value="${chapter.id}" data-title="${chapter.title}">
          <div class="item-content">
            <span class="item-title">${chapter.title}</span>
            <span class="mastery-display">${chapter.mastery || 0}% mastery</span>
          </div>
        </label>
      `).join('');
    } else {
      container.innerHTML = '<p>No chapters available for this subject.</p>';
    }
  }

  loadLessons() {
    if (!this.selectedSubject) return;
    
    const curriculum = LocalStorageManager.load(`curriculum_${this.selectedSubject.id}`) || [];
    const lessons = curriculum.filter(item => item.type === 'lesson');
    const container = document.getElementById('lessonSelector');
    
    // Filter lessons by selected chapters
    const filteredLessons = lessons.filter(lesson => 
      this.selectedChapters.includes(lesson.chapterId)
    );
    
    if (filteredLessons.length > 0) {
      container.innerHTML = filteredLessons.map(lesson => `
        <label class="selection-item">
          <input type="checkbox" value="${lesson.id}" data-title="${lesson.title}" data-chapter="${lesson.chapterTitle}">
          <div class="item-content">
            <span class="item-title">${lesson.title}</span>
            <span class="item-subtitle">Chapter: ${lesson.chapterTitle}</span>
            <span class="mastery-display">${lesson.mastery || 0}% mastery</span>
          </div>
        </label>
      `).join('');
    } else {
      container.innerHTML = '<p>No lessons available for selected chapters.</p>';
    }
  }

  setupEventListeners() {
    // Navigation buttons
    document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
    document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
    
    // Select all/clear all buttons
    document.getElementById('selectAllChapters').addEventListener('click', () => this.selectAllChapters());
    document.getElementById('clearAllChapters').addEventListener('click', () => this.clearAllChapters());
    document.getElementById('selectAllLessons').addEventListener('click', () => this.selectAllLessons());
    document.getElementById('clearAllLessons').addEventListener('click', () => this.clearAllLessons());
    
    // Generate quiz button
    document.getElementById('generateQuizBtn').addEventListener('click', () => this.generateQuiz());
    document.getElementById('resetQuizBtn').addEventListener('click', () => this.resetQuiz());
    
    // Quiz modal events
    document.getElementById('submitQuiz').addEventListener('click', () => this.submitQuiz());
    document.getElementById('cancelQuiz').addEventListener('click', () => this.closeQuizModal());
    
    // Results modal events
    document.querySelectorAll('#resultsModal .close-btn, #resultsModal .close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeResultsModal());
    });
  }

  nextStep() {
    if (this.currentStep === 1) {
      // Moving from subject to chapters
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      // Moving from chapters to lessons
      this.selectedChapters = Array.from(document.querySelectorAll('#chapterSelector input:checked'))
        .map(cb => cb.value);
      
      if (this.selectedChapters.length === 0) {
        if (window.Notify) Notify.error('Please select at least one chapter');
        return;
      }
      
      this.loadLessons();
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      // Moving from lessons to options
      this.selectedLessons = Array.from(document.querySelectorAll('#lessonSelector input:checked'))
        .map(cb => cb.value);
      
      if (this.selectedLessons.length === 0) {
        if (window.Notify) Notify.error('Please select at least one lesson');
        return;
      }
      
      this.currentStep = 4;
    }
    
    this.updateStepVisibility();
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepVisibility();
    }
  }

  updateStepVisibility() {
    // Hide all steps
    document.querySelectorAll('.quiz-step').forEach(step => step.style.display = 'none');
    
    // Show current step
    const steps = ['', 'subjectStep', 'chapterStep', 'lessonStep', 'optionsStep'];
    document.getElementById(steps[this.currentStep]).style.display = 'block';
    
    // Update navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
    nextBtn.style.display = this.currentStep < 4 ? 'inline-block' : 'none';
  }

  selectAllChapters() {
    document.querySelectorAll('#chapterSelector input[type="checkbox"]').forEach(cb => cb.checked = true);
  }

  clearAllChapters() {
    document.querySelectorAll('#chapterSelector input[type="checkbox"]').forEach(cb => cb.checked = false);
  }

  selectAllLessons() {
    document.querySelectorAll('#lessonSelector input[type="checkbox"]').forEach(cb => cb.checked = true);
  }

  clearAllLessons() {
    document.querySelectorAll('#lessonSelector input[type="checkbox"]').forEach(cb => cb.checked = false);
  }

  async generateQuiz() {
    try {
      // Get quiz options
      const questionCount = parseInt(document.getElementById('questionCount').value);
      const difficulty = document.getElementById('difficultyLevel').value;
      const questionTypes = Array.from(document.querySelectorAll('input[name="questionTypes"]:checked'))
        .map(cb => cb.value);
      
      if (questionTypes.length === 0) {
        if (window.Notify) Notify.error('Please select at least one question type');
        return;
      }
      
      // Get selected content
      const selectedChapterTitles = this.selectedChapters.map(id => {
        const curriculum = LocalStorageManager.load(`curriculum_${this.selectedSubject.id}`) || [];
        const chapter = curriculum.find(item => item.id === id);
        return chapter ? chapter.title : '';
      }).filter(title => title);
      
      const selectedLessonTitles = this.selectedLessons.map(id => {
        const curriculum = LocalStorageManager.load(`curriculum_${this.selectedSubject.id}`) || [];
        const lesson = curriculum.find(item => item.id === id);
        return lesson ? lesson.title : '';
      }).filter(title => title);
      
      // Remove duplicate variable declaration - use the one below
      
      // Show loading
      if (window.Notify) Notify.info('Generating quiz with AI...');
      
      // Generate quiz using AI with proper format
      if (window.AIConfig) {
        // Create proper AI request for each lesson
        const allQuestions = [];
        
        for (const lessonTitle of selectedLessonTitles) {
          const questionsPerLesson = Math.ceil(questionCount / selectedLessonTitles.length);
          const typeString = questionTypes.join(' and ');
          
          const aiPrompt = `Give me ${questionsPerLesson} ${difficulty} ${typeString} questions about ${lessonTitle}`;
          console.log('AI Prompt:', aiPrompt);
          
          const lessonQuestions = await window.AIConfig.generateQuiz(lessonTitle, difficulty, questionsPerLesson, questionTypes);
          allQuestions.push(...lessonQuestions);
        }
        
        // Trim to exact number requested
        this.quizData = allQuestions.slice(0, questionCount);
        this.showQuizModal();
      } else {
        if (window.Notify) Notify.error('AI integration not available');
      }
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      if (window.Notify) Notify.error('Error generating quiz. Please try again.');
    }
  }

  showQuizModal() {
    const modal = document.getElementById('quizModal');
    const container = document.getElementById('quizContainer');
    const title = document.getElementById('quizTitle');
    
    title.textContent = `${this.selectedSubject.name} Quiz`;
    
    container.innerHTML = this.quizData.map((question, index) => `
      <div class="quiz-question" data-question-index="${index}">
        <h3>Question ${index + 1}</h3>
        <p class="question-text">${question.question}</p>
        
        ${question.type === 'mcq' ? `
          <div class="mcq-options">
            ${question.options.map((option, optIndex) => `
              <label class="mcq-option">
                <input type="radio" name="q${index}" value="${option}">
                <span>${option}</span>
              </label>
            `).join('')}
          </div>
        ` : `
          <div class="text-answer">
            <textarea name="q${index}" placeholder="Enter your answer here..." rows="3"></textarea>
          </div>
        `}
      </div>
    `).join('');
    
    modal.style.display = 'block';
  }

  submitQuiz() {
    const answers = this.quizData.map((question, index) => {
      if (question.type === 'mcq') {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        return selected ? selected.value : '';
      } else {
        const textarea = document.querySelector(`textarea[name="q${index}"]`);
        return textarea ? textarea.value.trim() : '';
      }
    });
    
    // Score the quiz
    const score = this.scoreQuiz(answers);
    
    // Update mastery levels
    this.updateMasteryLevels(score);
    
    // Show results
    this.showResults(score, answers);
    
    // Close quiz modal
    this.closeQuizModal();
  }

  scoreQuiz(answers) {
    let correct = 0;
    let total = this.quizData.length;
    
    this.quizData.forEach((question, index) => {
      const userAnswer = answers[index];
      const correctAnswer = question.correct;
      
      if (question.type === 'mcq') {
        if (userAnswer === correctAnswer) correct++;
      } else {
        // Simple text matching for non-MCQ questions
        if (userAnswer.toLowerCase().includes(correctAnswer.toLowerCase()) || 
            correctAnswer.toLowerCase().includes(userAnswer.toLowerCase())) {
          correct++;
        }
      }
    });
    
    return {
      correct,
      total,
      percentage: Math.round((correct / total) * 100)
    };
  }

  updateMasteryLevels(score) {
    const curriculum = LocalStorageManager.load(`curriculum_${this.selectedSubject.id}`) || [];
    
    // Update selected chapters
    this.selectedChapters.forEach(chapterId => {
      const chapterIndex = curriculum.findIndex(item => item.id === chapterId);
      if (chapterIndex !== -1) {
        const currentMastery = curriculum[chapterIndex].mastery || 0;
        const newMastery = Math.round((currentMastery + score.percentage) / 2); // Average with previous
        curriculum[chapterIndex].mastery = newMastery;
        curriculum[chapterIndex].quizzesTaken = (curriculum[chapterIndex].quizzesTaken || 0) + 1;
        curriculum[chapterIndex].quizzesCorrect = (curriculum[chapterIndex].quizzesCorrect || 0) + score.correct;
      }
    });
    
    // Update selected lessons
    this.selectedLessons.forEach(lessonId => {
      const lessonIndex = curriculum.findIndex(item => item.id === lessonId);
      if (lessonIndex !== -1) {
        const currentMastery = curriculum[lessonIndex].mastery || 0;
        const newMastery = Math.round((currentMastery + score.percentage) / 2); // Average with previous
        curriculum[lessonIndex].mastery = newMastery;
        curriculum[lessonIndex].quizzesTaken = (curriculum[lessonIndex].quizzesTaken || 0) + 1;
        curriculum[lessonIndex].quizzesCorrect = (curriculum[lessonIndex].quizzesCorrect || 0) + score.correct;
      }
    });
    
    // Save updated curriculum
    LocalStorageManager.save(`curriculum_${this.selectedSubject.id}`, curriculum);
    
    // Save to Firebase
    if (window.FirebaseManager) {
      window.FirebaseManager.queueForSync('curriculum', {
        subjectId: this.selectedSubject.id,
        data: curriculum,
        timestamp: new Date().toISOString()
      });
    }
  }

  showResults(score, answers) {
    const modal = document.getElementById('resultsModal');
    const container = document.getElementById('resultsContainer');
    
    container.innerHTML = `
      <div class="score-display">
        <div class="score-circle ${score.percentage >= 80 ? 'excellent' : score.percentage >= 60 ? 'good' : 'needs-improvement'}">
          <span class="score-number">${score.percentage}%</span>
          <span class="score-text">${score.correct}/${score.total}</span>
        </div>
      </div>
      
      <div class="score-breakdown">
        <h3>Performance Breakdown</h3>
        <div class="breakdown-item">
          <span>Correct Answers:</span>
          <span>${score.correct}</span>
        </div>
        <div class="breakdown-item">
          <span>Total Questions:</span>
          <span>${score.total}</span>
        </div>
        <div class="breakdown-item">
          <span>Success Rate:</span>
          <span>${score.percentage}%</span>
        </div>
      </div>
      
      <div class="mastery-update">
        <h3>Mastery Updated</h3>
        <p>Your mastery levels have been updated for:</p>
        <ul>
          ${this.selectedChapters.map(id => {
            const curriculum = LocalStorageManager.load(`curriculum_${this.selectedSubject.id}`) || [];
            const chapter = curriculum.find(item => item.id === id);
            return chapter ? `<li>${chapter.title}: ${chapter.mastery}% mastery</li>` : '';
          }).join('')}
          ${this.selectedLessons.map(id => {
            const curriculum = LocalStorageManager.load(`curriculum_${this.selectedSubject.id}`) || [];
            const lesson = curriculum.find(item => item.id === id);
            return lesson ? `<li>${lesson.title}: ${lesson.mastery}% mastery</li>` : '';
          }).join('')}
        </ul>
      </div>
    `;
    
    modal.style.display = 'block';
  }

  closeQuizModal() {
    document.getElementById('quizModal').style.display = 'none';
  }

  closeResultsModal() {
    document.getElementById('resultsModal').style.display = 'none';
  }

  resetQuiz() {
    this.currentStep = 1;
    this.selectedSubject = null;
    this.selectedChapters = [];
    this.selectedLessons = [];
    this.quizData = null;
    
    // Reset UI
    document.querySelectorAll('.subject-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    this.updateStepVisibility();
  }
}

// Initialize AI Quiz Tool
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('ai-quiz.html')) {
    new AIQuizTool();
  }
});
