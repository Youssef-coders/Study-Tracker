// Authentication Manager
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.users = this.loadUsers();
  }

  static init() {
    const authManager = new AuthManager();
    
    // Only setup auth forms if on auth page
    if (window.location.pathname.includes('auth.html')) {
      authManager.setupAuthSystem();
    } else {
      authManager.checkAuthStatus();
    }
  }

  setupAuthSystem() {
    this.setupTabSwitching();
    this.setupForms();
    this.setupPricingButtons();
  }

  setupTabSwitching() {
    console.log('Setting up tab switching...');
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form-container');
    
    console.log('Found tabs:', tabs.length);
    console.log('Found forms:', forms.length);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        console.log('Tab clicked:', targetTab);
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        forms.forEach(form => {
          form.classList.add('hidden');
          console.log('Hiding form:', form.id);
        });
        
        const targetForm = document.getElementById(`${targetTab}Form`);
        if (targetForm) {
          targetForm.classList.remove('hidden');
          console.log('Showing form:', targetForm.id);
        } else {
          console.error('Target form not found:', `${targetTab}Form`);
        }
      });
    });

    // Handle auth links
    document.querySelectorAll('.link[data-tab]').forEach(link => {
      link.addEventListener('click', () => {
        const targetTab = link.dataset.tab;
        console.log('Auth link clicked:', targetTab);
        const tabButton = document.querySelector(`[data-tab="${targetTab}"]`);
        if (tabButton) {
          tabButton.click();
        } else {
          console.error('Tab button not found for:', targetTab);
        }
      });
    });
    
    console.log('Tab switching setup complete');
  }

  setupForms() {
    // Login form
    const loginForm = document.getElementById('loginFormElement');
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Signup form
    const signupForm = document.getElementById('signupFormElement');
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignup();
    });
  }

  setupPricingButtons() {
    document.querySelectorAll('[data-plan]').forEach(button => {
      button.addEventListener('click', () => {
        const plan = button.dataset.plan;
        this.handlePlanSelection(plan);
      });
    });
  }

  handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
      this.showError('Please fill in all fields');
      return;
    }

    // Check if user exists and password matches
    const user = this.users.find(u => u.username === username);
    if (!user) {
      this.showError('Username not found');
      return;
    }

    if (user.password !== password) {
      this.showError('Incorrect password');
      return;
    }

    // Successful login
    this.loginUser(user);
  }

  handleSignup() {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validation
    if (!username || !password || !confirmPassword) {
      this.showError('Please fill in required fields');
      return;
    }

    if (username.length < 3) {
      this.showError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    // Check if username already exists
    if (this.users.find(u => u.username === username)) {
      this.showError('Username already exists');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: username,
      email: email || '',
      password: password,
      plan: 'free',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();
    
    // Auto-login after signup
    this.loginUser(newUser);
  }

  handlePlanSelection(plan) {
    const prices = {
      monthly: '$3/month',
      yearly: '$8/year',
      lifetime: '$10 one-time'
    };

    if (window.Notify) {
      Notify.info(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan (${prices[plan]}) - Payment integration coming soon!`);
    } else {
      alert(`${plan.charAt(0).toUpperCase() + plan.slice(1)} plan (${prices[plan]}) - Payment integration coming soon!`);
    }

    // For now, just switch to signup
    document.querySelector('[data-tab="signup"]').click();
  }

  loginUser(user) {
    // Update user's last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers();

    // Set current user
    this.currentUser = user;
    LocalStorageManager.save('currentUser', user);

    // Show success message
    if (window.Notify) {
      Notify.success(`Welcome back, ${user.username}!`);
    }

    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  }

  checkAuthStatus() {
    // Check if user is already logged in
    const savedUser = LocalStorageManager.load('currentUser');
    if (savedUser && this.users.find(u => u.id === savedUser.id)) {
      // User is logged in, redirect to dashboard
      if (window.location.pathname.includes('auth.html')) {
        window.location.href = 'dashboard.html';
      }
    }
  }

  loadUsers() {
    return LocalStorageManager.load('users') || [];
  }

  saveUsers() {
    LocalStorageManager.save('users', this.users);
  }

  showError(message) {
    if (window.Notify) {
      Notify.error(message);
    } else {
      alert('Error: ' + message);
    }
  }

  // Static method to logout (can be called from other pages)
  static logout() {
    LocalStorageManager.remove('currentUser');
    window.location.href = 'index.html';
  }

  // Static method to get current user (can be called from other pages)
  static getCurrentUser() {
    return LocalStorageManager.load('currentUser');
  }

  // Static method to check if user is authenticated
  static isAuthenticated() {
    const user = LocalStorageManager.load('currentUser');
    return user && user.username;
  }
}

// Protect other pages - redirect to login if not authenticated
if (window.location.pathname !== '/' && 
    !window.location.pathname.includes('index.html') && 
    !window.location.pathname.includes('auth.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    if (!AuthManager.isAuthenticated()) {
      window.location.href = 'auth.html';
    }
  });
}
