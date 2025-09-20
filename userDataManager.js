// User Data Manager - Handles user-specific data isolation
class UserDataManager {
  static getCurrentUser() {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch(e) {
      console.error('Error getting current user:', e);
      return null;
    }
  }

  static getUserDataKey(key) {
    const user = this.getCurrentUser();
    if (!user) {
      console.error('No current user found');
      return null;
    }
    return `user_${user.id}_${key}`;
  }

  static saveUserData(key, data) {
    const userKey = this.getUserDataKey(key);
    if (!userKey) return false;
    
    try {
      localStorage.setItem(userKey, JSON.stringify(data));
      console.log(`Saved user data: ${userKey}`, data);
      return true;
    } catch(e) {
      console.error('Error saving user data:', e);
      return false;
    }
  }

  static loadUserData(key) {
    const userKey = this.getUserDataKey(key);
    if (!userKey) return null;
    
    try {
      const data = localStorage.getItem(userKey);
      return data ? JSON.parse(data) : null;
    } catch(e) {
      console.error('Error loading user data:', e);
      return null;
    }
  }

  static removeUserData(key) {
    const userKey = this.getUserDataKey(key);
    if (!userKey) return false;
    
    try {
      localStorage.removeItem(userKey);
      return true;
    } catch(e) {
      console.error('Error removing user data:', e);
      return false;
    }
  }

  // Migrate existing data to current user (for first-time users)
  static migrateExistingData() {
    const user = this.getCurrentUser();
    if (!user) return;

    console.log('Migrating existing data for user:', user.username);

    const keysToMigrate = [
      'assignments', 'userSubjects', 'studyHours', 'hoursDate', 
      'streak', 'lastStudyDate', 'highestStreak', 'customThemes', 
      'currentTheme', 'dailyHours', 'monthlyHours', 'subjectHours',
      'monthlySubjectHours', 'studyGoals', 'scheduleEvents',
      'lessonQuizzes', 'quizSchedule', 'flashcardSets'
    ];

    keysToMigrate.forEach(key => {
      // Check if user already has this data
      const userDataKey = this.getUserDataKey(key);
      if (localStorage.getItem(userDataKey)) {
        console.log(`User already has ${key}, skipping migration`);
        return;
      }

      // Check if global data exists
      const globalData = localStorage.getItem(key);
      if (globalData) {
        console.log(`Migrating ${key} to user-specific storage`);
        localStorage.setItem(userDataKey, globalData);
        // Don't remove global data yet - other users might need it
      }
    });

    console.log('Data migration complete');
  }

  // Clear all data for current user (for logout/reset)
  static clearUserData() {
    const user = this.getCurrentUser();
    if (!user) return;

    console.log('Clearing data for user:', user.username);

    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    const userPrefix = `user_${user.id}_`;

    keys.forEach(key => {
      if (key.startsWith(userPrefix)) {
        localStorage.removeItem(key);
      }
    });

    console.log('User data cleared');
  }

  // Get all users (admin function)
  static getAllUsers() {
    try {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch(e) {
      console.error('Error getting all users:', e);
      return [];
    }
  }

  // Switch to different user (admin function)
  static switchUser(userId) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('Switched to user:', user.username);
      return true;
    }
    
    console.error('User not found:', userId);
    return false;
  }
}

// Override LocalStorageManager to use user-specific storage
if (typeof LocalStorageManager !== 'undefined') {
  console.log('Overriding LocalStorageManager for user-specific data');
  
  const originalSave = LocalStorageManager.save;
  const originalLoad = LocalStorageManager.load;
  const originalRemove = LocalStorageManager.remove;

  LocalStorageManager.save = function(key, data) {
    // Don't isolate user management data
    if (key === 'users' || key === 'currentUser') {
      return originalSave.call(this, key, data);
    }
    
    // Use user-specific storage for everything else
    return UserDataManager.saveUserData(key, data);
  };

  LocalStorageManager.load = function(key) {
    // Don't isolate user management data
    if (key === 'users' || key === 'currentUser') {
      return originalLoad.call(this, key);
    }
    
    // Use user-specific storage for everything else
    return UserDataManager.loadUserData(key);
  };

  LocalStorageManager.remove = function(key) {
    // Don't isolate user management data
    if (key === 'users' || key === 'currentUser') {
      return originalRemove.call(this, key);
    }
    
    // Use user-specific storage for everything else
    return UserDataManager.removeUserData(key);
  };
}

// Initialize user data isolation when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only migrate data if user is logged in
  if (UserDataManager.getCurrentUser()) {
    UserDataManager.migrateExistingData();
  }
});
