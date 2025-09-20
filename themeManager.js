// Theme Management System
class ThemeManager {
  constructor() {
    this.themes = this.loadThemes();
    this.currentTheme = this.loadCurrentTheme();
    this.init();
  }

  init() {
    this.applyCurrentTheme();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupThemeManagement());
    } else {
      this.setupThemeManagement();
    }
  }

  loadThemes() {
    let customThemes = LocalStorageManager.load('customThemes') || [];
    
    // Clean up invalid custom themes
    customThemes = customThemes.filter(theme => 
      theme && theme.name && theme.primary && theme.secondary && 
      theme.name.trim().length > 0 && theme.name !== 'Test' && theme.name !== 'what'
    );
    
    // Save cleaned themes back
    LocalStorageManager.save('customThemes', customThemes);
    
    // Predefined themes
    const predefinedThemes = [
      {
        id: 'default',
        name: 'Default Blue',
        primary: '#2B5D8A',
        secondary: '#1976D2',
        text: '#333333',
        background: '#f0f2f5',
        navButton: '#2B5D8A',
        navActive: '#1976D2',
        border: '#2B5D8A',
        isPredefined: true
      },
      {
        id: 'forest',
        name: 'Forest Green',
        primary: '#2E7D32',
        secondary: '#4CAF50',
        text: '#1B5E20',
        background: '#f1f8e9',
        navButton: '#2E7D32',
        navActive: '#4CAF50',
        border: '#2E7D32',
        isPredefined: true
      },
      {
        id: 'sunset',
        name: 'Sunset Orange',
        primary: '#F57C00',
        secondary: '#FF9800',
        text: '#E65100',
        background: '#fff8e1',
        navButton: '#F57C00',
        navActive: '#FF9800',
        border: '#F57C00',
        isPredefined: true
      },
      {
        id: 'royal',
        name: 'Royal Purple',
        primary: '#7B1FA2',
        secondary: '#9C27B0',
        text: '#4A148C',
        background: '#f3e5f5',
        navButton: '#7B1FA2',
        navActive: '#9C27B0',
        border: '#7B1FA2',
        isPredefined: true
      },
      {
        id: 'crimson',
        name: 'Crimson Red',
        primary: '#C62828',
        secondary: '#F44336',
        text: '#B71C1C',
        background: '#ffebee',
        navButton: '#C62828',
        navActive: '#F44336',
        border: '#C62828',
        isPredefined: true
      },
      {
        id: 'ocean',
        name: 'Ocean Teal',
        primary: '#00695C',
        secondary: '#009688',
        text: '#004D40',
        background: '#e0f2f1',
        navButton: '#00695C',
        navActive: '#009688',
        border: '#00695C',
        isPredefined: true
      },
      {
        id: 'midnight',
        name: 'Midnight Dark',
        primary: '#263238',
        secondary: '#37474F',
        text: '#ECEFF1',
        background: '#121212',
        navButton: '#37474F',
        navActive: '#546E7A',
        border: '#37474F',
        isPredefined: true
      }
    ];

    return [...predefinedThemes, ...customThemes];
  }

  loadCurrentTheme() {
    const savedTheme = LocalStorageManager.load('currentTheme');
    return savedTheme || 'default';
  }

  setupThemeManagement() {
    this.setupSettingsIcon();
    
    if (window.location.pathname.includes('settings.html')) {
      this.renderThemeSettings();
    }
  }

  setupSettingsIcon() {
    // Make sure settings icon works on all pages
    const settingsIcon = document.getElementById('settingsIcon');
    if (settingsIcon) {
      // Remove any existing onclick
      settingsIcon.removeAttribute('onclick');
      
      // Add proper event listener
      settingsIcon.addEventListener('click', () => {
        console.log('Settings icon clicked');
        window.location.href = 'settings.html';
      });
      
      console.log('Settings icon setup complete');
    }
  }

  renderThemeSettings() {
    const settingsCard = document.querySelector('.settings-card');
    if (!settingsCard) return;

    // Add theme section to settings
    const themeSection = document.createElement('div');
    themeSection.className = 'setting theme-setting';
    themeSection.innerHTML = `
      <div class="theme-header">
        <h3>Themes</h3>
        <button class="create-theme-btn" id="createThemeBtn">Create Custom Theme</button>
      </div>
      <div class="theme-grid" id="themeGrid">
        <!-- Themes will be loaded here -->
      </div>
    `;

    settingsCard.appendChild(themeSection);
    
    console.log('Theme section added, loading themes...');
    console.log('Available themes:', this.themes);
    
    // Set up theme grid content immediately
    this.refreshThemeGrid();
    this.setupThemeEvents();
    this.createThemeModal();
  }

  renderThemeOptions() {
    return this.themes.map(theme => `
      <div class="theme-option ${this.currentTheme === theme.id ? 'selected' : ''}" 
           data-theme-id="${theme.id}"
           style="--preview-primary: ${theme.primary}; --preview-secondary: ${theme.secondary}; --preview-text: ${theme.text}; --preview-bg: ${theme.background}">
        <div class="theme-preview">
          <div class="preview-header" style="background: ${theme.primary}"></div>
          <div class="preview-content" style="background: ${theme.background}; color: ${theme.text}">
            <div class="preview-element" style="background: ${theme.secondary}"></div>
            <div class="preview-text" style="color: ${theme.text}">${theme.name}</div>
          </div>
        </div>
        <div class="theme-info">
          <span class="theme-name">${theme.name}</span>
          ${!theme.isPredefined ? `<button class="delete-theme-btn" data-theme-id="${theme.id}">🗑️</button>` : ''}
        </div>
      </div>
    `).join('');
  }

  refreshThemeGrid() {
    const themeGrid = document.getElementById('themeGrid');
    console.log('Refreshing theme grid...', themeGrid);
    if (themeGrid) {
      const html = this.renderThemeOptions();
      console.log('Generated theme HTML:', html);
      themeGrid.innerHTML = html;
      console.log('Theme grid updated');
    } else {
      console.error('Theme grid element not found!');
    }
  }

  setupThemeEvents() {
    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', () => {
        const themeId = option.dataset.themeId;
        this.selectTheme(themeId);
      });
    });

    // Create theme button
    document.getElementById('createThemeBtn')?.addEventListener('click', () => {
      this.showCreateThemeModal();
    });

    // Delete theme buttons
    document.querySelectorAll('.delete-theme-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeId = btn.dataset.themeId;
        this.deleteTheme(themeId);
      });
    });
  }

  selectTheme(themeId) {
    this.currentTheme = themeId;
    LocalStorageManager.save('currentTheme', themeId);
    
    // Update UI
    document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelector(`[data-theme-id="${themeId}"]`)?.classList.add('selected');
    
    // Apply theme
    this.applyCurrentTheme();
    
    if (window.Notify) {
      const theme = this.themes.find(t => t.id === themeId);
      Notify.success(`Applied ${theme.name} theme!`);
    }
  }

  applyCurrentTheme() {
    const theme = this.themes.find(t => t.id === this.currentTheme);
    if (!theme) return;

    console.log('Applying theme:', theme.name);

    // Apply CSS custom properties - FORCE OVERRIDE
    const root = document.documentElement;
    root.style.setProperty('--term-color', theme.navButton, 'important');
    root.style.setProperty('--term-color-rgb', this.hexToRgb(theme.navButton), 'important');
    root.style.setProperty('--secondary-color', theme.secondary, 'important');
    root.style.setProperty('--text-color', theme.text, 'important');
    root.style.setProperty('--background-color', theme.background, 'important');
    root.style.setProperty('--nav-button-color', theme.navButton, 'important');
    root.style.setProperty('--nav-active-color', theme.navActive, 'important');
    root.style.setProperty('--border-color', theme.border, 'important');
    
    // Force immediate navbar update
    document.querySelectorAll('.navbar a, .navbar .term-element').forEach(btn => {
      btn.style.backgroundColor = theme.navButton;
      btn.style.background = theme.navButton;
    });
    
    document.querySelectorAll('.navbar a.active').forEach(btn => {
      btn.style.backgroundColor = theme.navActive;
      btn.style.background = theme.navActive;
    });

    // Update any existing theme styles
    const existingStyle = document.querySelector('#theme-style');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'theme-style';
    style.textContent = `
      :root {
        --term-color: ${theme.primary};
        --term-color-rgb: ${this.hexToRgb(theme.primary)};
        --secondary-color: ${theme.secondary};
        --text-color: ${theme.text};
        --background-color: ${theme.background};
        --nav-button-color: ${theme.navButton};
        --nav-active-color: ${theme.navActive};
        --border-color: ${theme.border};
      }
      
      /* Apply theme to all pages */
      body {
        background: linear-gradient(to right, ${theme.background}, ${this.lightenColor(theme.background, 10)}) !important;
        color: ${theme.text} !important;
      }
      
      /* Headers and sidebars */
      header {
        background-color: ${theme.primary} !important;
      }
      
      .sidewallleft, .sidewallright {
        background-color: ${theme.primary} !important;
      }
      
      /* Navigation buttons - NUCLEAR OVERRIDE - FORCE ALL STATES */
      .navbar a,
      body .navbar a,
      html body .navbar a,
      body.term-0 .navbar a,
      body.term-1 .navbar a,
      body.term-2 .navbar a,
      body.dark-mode .navbar a,
      body.blackout-mode .navbar a,
      body.term-0.dark-mode .navbar a,
      body.term-1.dark-mode .navbar a,
      body.term-2.dark-mode .navbar a,
      body.term-0.blackout-mode .navbar a,
      body.term-1.blackout-mode .navbar a,
      body.term-2.blackout-mode .navbar a,
      .navbar .term-element,
      body .navbar .term-element {
        background-color: ${theme.navButton} !important;
        background: ${theme.navButton} !important;
        color: white !important;
      }
      
      .navbar a.active,
      body .navbar a.active,
      body.term-0 .navbar a.active,
      body.term-1 .navbar a.active,
      body.term-2 .navbar a.active,
      body.dark-mode .navbar a.active,
      body.blackout-mode .navbar a.active,
      body.term-0.dark-mode .navbar a.active,
      body.term-1.dark-mode .navbar a.active,
      body.term-2.dark-mode .navbar a.active,
      body.term-0.blackout-mode .navbar a.active,
      body.term-1.blackout-mode .navbar a.active,
      body.term-2.blackout-mode .navbar a.active {
        background-color: ${theme.navActive} !important;
        color: white !important;
      }
      
      .navbar a:hover,
      body .navbar a:hover,
      body.term-0 .navbar a:hover,
      body.term-1 .navbar a:hover,
      body.term-2 .navbar a:hover,
      body.dark-mode .navbar a:hover,
      body.blackout-mode .navbar a:hover {
        background-color: ${theme.navActive} !important;
        color: white !important;
      }
      
      /* Settings page - all setting boxes */
      .setting {
        border-color: ${theme.border} !important;
        background-color: white !important;
      }
      
      .setting h3 {
        color: ${theme.primary} !important;
      }
      
      /* Settings buttons */
      .setting .button-group button {
        background-color: ${theme.navButton} !important;
        color: white !important;
      }
      
      .setting .button-group button:hover {
        background-color: ${theme.navActive} !important;
      }
      
      /* Settings icon */
      .settings-icon {
        background: ${theme.navButton} !important;
        color: white !important;
      }
      
      .settings-icon:hover {
        background: ${theme.navActive} !important;
      }
      
      .settings-icon svg {
        color: white !important;
        stroke: white !important;
      }
      
      /* Cards and borders */
      .hourcard, .streakcard, .curric-card, .widecard, .settings-card,
      .analytics-card, .goal-card, .subject-hour-card, .chart-container {
        border-color: ${theme.border} !important;
      }
      
      /* Tool cards */
      .tool-card {
        border-color: ${theme.border} !important;
        background-color: white !important;
      }
      
      .tool-card h3 {
        color: ${theme.primary} !important;
      }
      
      .open-tool-btn {
        background-color: ${theme.primary} !important;
        color: white !important;
      }
      
      .open-tool-btn:hover {
        background-color: ${theme.secondary} !important;
      }
      
      /* Assignment cards background */
      .widecard {
        background-color: white !important;
        border-color: ${theme.border} !important;
      }
      
      .widecard h2 {
        background-color: ${theme.primary} !important;
        color: white !important;
        padding: 15px !important;
        margin: -15px -15px 15px -15px !important;
        border-radius: 15px 15px 0 0 !important;
      }
      
      /* Assignment items themselves */
      .upassign {
        background-color: white !important;
      }
      
      /* Assignment container */
      .assigncontainer {
        background-color: transparent !important;
      }
      
      /* Fix all grey backgrounds */
      .assignment-item, .assignment-card, .homework-item {
        background-color: white !important;
      }
      
      /* Assignment header specifically */
      .assignment-header, .homework-header {
        background-color: ${theme.primary} !important;
        color: white !important;
      }
      
      /* Card headers with titles - like "Assignments" */
      .card-header .card-title,
      body .card-header .card-title,
      body.term-0 .card-header .card-title,
      body.term-1 .card-header .card-title,
      body.term-2 .card-header .card-title {
        background-color: ${theme.primary} !important;
        color: white !important;
      }
      
      /* Homework page assignments container */
      .curric-card {
        background-color: white !important;
        border-color: ${theme.border} !important;
      }
      
      /* Individual assignment items on homework page */
      .upassign {
        background-color: white !important;
        border-color: ${theme.border} !important;
      }
      
      /* Override urgency-based backgrounds - ULTRA SPECIFIC */
      .curric-card .upassign,
      body .curric-card .upassign,
      .curric-card .upassign.urgency-low,
      .curric-card .upassign.urgency-medium,
      .curric-card .upassign.urgency-high,
      .curric-card .upassign.urgency-critical,
      .assignment-item,
      body .assignment-item,
      .assignment-item.urgency-low,
      .assignment-item.urgency-medium,
      .assignment-item.urgency-high,
      .assignment-item.urgency-critical,
      .upassign,
      body .upassign {
        background-color: white !important;
        border-color: ${theme.border} !important;
      }
      
      /* Assignment container on dashboard */
      .assigncontainer {
        background-color: white !important;
      }
      
      /* Any remaining grey elements */
      .grey-background, .default-grey, .bg-grey {
        background-color: white !important;
      }
      
      /* Buttons */
      .goal-btn, .add-subject-btn, .create-theme-btn, .generate-quiz-btn,
      .save-btn, .addlesson, .addchapter, .addresource, .addassignment {
        background-color: ${theme.primary} !important;
        color: white !important;
      }
      
      .goal-btn:hover, .add-subject-btn:hover, .create-theme-btn:hover,
      .generate-quiz-btn:hover, .save-btn:hover, .addassignment:hover {
        background-color: ${theme.secondary} !important;
      }
      
      /* Progress bars and fills */
      .progress-fill, .subject-fill, .bar-fill {
        background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary}) !important;
      }
      
      /* Text colors */
      h1, h2, h3, h4, .day, .hours-display {
        color: ${theme.text} !important;
      }
      
      /* Subject cards */
      .subject-card {
        border-color: ${theme.border} !important;
      }
      
      /* Mastery percentages */
      .mastery-percentage {
        background-color: ${theme.primary} !important;
      }
      
      /* Analytics cards */
      .analytics-card h3, .goal-card h3, .subject-analytics h2 {
        color: ${theme.primary} !important;
      }
      
      /* Card headers and titles */
      .card-header h3, .card-title {
        color: ${theme.primary} !important;
      }
      
      /* Week display button */
      .week-display {
        background-color: ${theme.navButton} !important;
        color: white !important;
      }
      
      /* Homework page assignments header */
      .widecard h2 {
        background-color: ${theme.primary} !important;
        color: white !important;
        padding: 15px !important;
        margin: -15px -15px 15px -15px !important;
        border-radius: 15px 15px 0 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  createThemeModal() {
    if (document.getElementById('themeModal')) return;

    const modal = document.createElement('div');
    modal.id = 'themeModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content theme-modal-content">
        <span class="close-btn">&times;</span>
        <h2>Create Custom Theme</h2>
        <form id="themeForm">
          <div class="form-group">
            <label for="themeName">Theme Name:</label>
            <input type="text" id="themeName" required placeholder="e.g., My Custom Theme">
          </div>
          
          <div class="color-inputs">
            <div class="color-group">
              <label for="primaryColor">Primary Color:</label>
              <input type="color" id="primaryColor" value="#2B5D8A">
              <span class="color-preview" id="primaryPreview">#2B5D8A</span>
            </div>
            
            <div class="color-group">
              <label for="secondaryColor">Secondary Color:</label>
              <input type="color" id="secondaryColor" value="#1976D2">
              <span class="color-preview" id="secondaryPreview">#1976D2</span>
            </div>
            
            <div class="color-group">
              <label for="textColor">Text Color:</label>
              <input type="color" id="textColor" value="#333333">
              <span class="color-preview" id="textPreview">#333333</span>
            </div>
            
            <div class="color-group">
              <label for="backgroundColor">Background Color:</label>
              <input type="color" id="backgroundColor" value="#f0f2f5">
              <span class="color-preview" id="backgroundPreview">#f0f2f5</span>
            </div>
            
            <div class="color-group">
              <label for="navButtonColor">Nav Button Color:</label>
              <input type="color" id="navButtonColor" value="#2B5D8A">
              <span class="color-preview" id="navButtonPreview">#2B5D8A</span>
            </div>
            
            <div class="color-group">
              <label for="navActiveColor">Nav Active Color:</label>
              <input type="color" id="navActiveColor" value="#1976D2">
              <span class="color-preview" id="navActivePreview">#1976D2</span>
            </div>
            
            <div class="color-group">
              <label for="borderColor">Border Color:</label>
              <input type="color" id="borderColor" value="#2B5D8A">
              <span class="color-preview" id="borderPreview">#2B5D8A</span>
            </div>
          </div>
          
          <div class="theme-preview-section">
            <h3>Preview:</h3>
            <div class="live-preview" id="livePreview">
              <div class="preview-header">Header</div>
              <div class="preview-content">
                <div class="preview-card">Sample Card</div>
                <div class="preview-button">Button</div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="save-btn">Create Theme</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupThemeModalEvents(modal);
  }

  setupThemeModalEvents(modal) {
    const closeBtn = modal.querySelector('.close-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = modal.querySelector('#themeForm');
    const colorInputs = modal.querySelectorAll('input[type="color"]');

    // Close modal events
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });

    // Color preview updates
    colorInputs.forEach(input => {
      input.addEventListener('input', () => {
        this.updateThemePreview();
        this.updateColorPreview(input);
      });
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleThemeCreation();
    });
  }

  updateColorPreview(input) {
    const previewId = input.id + 'Preview';
    const preview = document.getElementById(previewId);
    if (preview) {
      preview.textContent = input.value;
      preview.style.backgroundColor = input.value;
      preview.style.color = this.getContrastColor(input.value);
    }
  }

  updateThemePreview() {
    const primary = document.getElementById('primaryColor').value;
    const secondary = document.getElementById('secondaryColor').value;
    const text = document.getElementById('textColor').value;
    const background = document.getElementById('backgroundColor').value;
    
    const preview = document.getElementById('livePreview');
    if (preview) {
      preview.style.setProperty('--preview-primary', primary);
      preview.style.setProperty('--preview-secondary', secondary);
      preview.style.setProperty('--preview-text', text);
      preview.style.setProperty('--preview-background', background);
    }
  }

  showCreateThemeModal() {
    const modal = document.getElementById('themeModal');
    modal.style.display = 'block';
    this.updateThemePreview();
  }

  handleThemeCreation() {
    const name = document.getElementById('themeName').value.trim();
    const primary = document.getElementById('primaryColor').value;
    const secondary = document.getElementById('secondaryColor').value;
    const text = document.getElementById('textColor').value;
    const background = document.getElementById('backgroundColor').value;
    const navButton = document.getElementById('navButtonColor').value;
    const navActive = document.getElementById('navActiveColor').value;
    const border = document.getElementById('borderColor').value;

    if (!name) {
      if (window.Notify) Notify.error('Please enter a theme name');
      return;
    }

    const newTheme = {
      id: this.generateThemeId(name),
      name,
      primary,
      secondary,
      text,
      background,
      navButton,
      navActive,
      border,
      isPredefined: false,
      created: new Date().toISOString()
    };

    // Add to themes
    this.themes.push(newTheme);
    this.saveThemes();

    // Close modal and refresh display
    document.getElementById('themeModal').style.display = 'none';
    
    if (window.location.pathname.includes('settings.html')) {
      this.refreshThemeGrid();
      this.setupThemeEvents();
    }

    if (window.Notify) {
      Notify.success(`Theme "${name}" created successfully!`);
    }
  }

  deleteTheme(themeId) {
    const theme = this.themes.find(t => t.id === themeId);
    if (!theme || theme.isPredefined) return;

    if (confirm(`Are you sure you want to delete the theme "${theme.name}"?`)) {
      this.themes = this.themes.filter(t => t.id !== themeId);
      
      // If current theme is being deleted, switch to default
      if (this.currentTheme === themeId) {
        this.selectTheme('default');
      }
      
      this.saveThemes();
      
      // Refresh display
      if (window.location.pathname.includes('settings.html')) {
        document.getElementById('themeGrid').innerHTML = this.renderThemeOptions();
        this.setupThemeEvents();
      }

      if (window.Notify) {
        Notify.success(`Theme "${theme.name}" deleted successfully!`);
      }
    }
  }

  saveThemes() {
    const customThemes = this.themes.filter(t => !t.isPredefined);
    LocalStorageManager.save('customThemes', customThemes);
    
    // Save to Firebase
    if (window.FirebaseManager) {
      window.FirebaseManager.queueForSync('themes', {
        themes: customThemes,
        timestamp: new Date().toISOString()
      });
    }
  }

  generateThemeId(name) {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '43, 93, 138';
  }

  lightenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  getContrastColor(hexColor) {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // Static method to get current theme
  static getCurrentTheme() {
    const themeManager = window.ThemeManager || new ThemeManager();
    return themeManager.themes.find(t => t.id === themeManager.currentTheme);
  }

  // Static method to apply theme by ID
  static applyTheme(themeId) {
    const themeManager = window.ThemeManager || new ThemeManager();
    themeManager.selectTheme(themeId);
  }
}

// Initialize theme manager
window.ThemeManager = new ThemeManager();

// Export for other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}
