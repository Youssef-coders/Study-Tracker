// Firebase Manager for Study Tracker
// This module handles Firebase integration and data synchronization

class FirebaseManager {
  constructor() {
    this.isInitialized = false;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.init();
  }

  async init() {
    try {
      // For now, we'll prepare the structure but not actually initialize Firebase
      // since we're using ES6 modules in a traditional HTML setup
      console.log('Firebase Manager initialized - ready for future integration');
      
      // Set up online/offline detection
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processSyncQueue();
      });
      
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Fallback to localStorage only
    }
  }

  // Queue data for sync when online
  queueForSync(collection, data, operation = 'create') {
    const syncItem = {
      id: Date.now().toString(),
      collection,
      data,
      operation,
      timestamp: new Date().toISOString()
    };
    
    this.syncQueue.push(syncItem);
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    console.log(`Processing ${this.syncQueue.length} queued items...`);
    
    // For now, just clear the queue and log
    // In full implementation, this would sync with Firebase
    const processed = this.syncQueue.splice(0);
    console.log('Processed sync queue:', processed);
  }

  // Analytics data methods
  async saveAnalyticsData(data) {
    try {
      // Save to localStorage immediately
      LocalStorageManager.save('analytics_' + data.type, data);
      
      // Queue for Firebase sync
      this.queueForSync('analytics', data, 'create');
      
      return { success: true };
    } catch (error) {
      console.error('Error saving analytics data:', error);
      return { success: false, error };
    }
  }

  async getAnalyticsData(type, dateRange = null) {
    try {
      // For now, get from localStorage
      const data = LocalStorageManager.load('analytics_' + type);
      
      if (dateRange && data) {
        // Filter by date range if specified
        return this.filterByDateRange(data, dateRange);
      }
      
      return data;
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return null;
    }
  }

  // User data methods
  async saveUserData(userId, userData) {
    try {
      // Save to localStorage
      LocalStorageManager.save('user_' + userId, userData);
      
      // Queue for Firebase sync
      this.queueForSync('users', { id: userId, ...userData }, 'update');
      
      return { success: true };
    } catch (error) {
      console.error('Error saving user data:', error);
      return { success: false, error };
    }
  }

  // Study session methods
  async logStudySession(sessionData) {
    try {
      const sessions = LocalStorageManager.load('studySessions') || [];
      sessions.push({
        ...sessionData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      
      LocalStorageManager.save('studySessions', sessions);
      
      // Queue for Firebase sync
      this.queueForSync('studySessions', sessionData, 'create');
      
      return { success: true };
    } catch (error) {
      console.error('Error logging study session:', error);
      return { success: false, error };
    }
  }

  async getStudySessions(filters = {}) {
    try {
      const sessions = LocalStorageManager.load('studySessions') || [];
      
      // Apply filters
      let filteredSessions = sessions;
      
      if (filters.subject) {
        filteredSessions = filteredSessions.filter(s => s.subject === filters.subject);
      }
      
      if (filters.dateFrom) {
        filteredSessions = filteredSessions.filter(s => 
          new Date(s.timestamp) >= new Date(filters.dateFrom)
        );
      }
      
      if (filters.dateTo) {
        filteredSessions = filteredSessions.filter(s => 
          new Date(s.timestamp) <= new Date(filters.dateTo)
        );
      }
      
      return filteredSessions;
    } catch (error) {
      console.error('Error getting study sessions:', error);
      return [];
    }
  }

  // Assignment methods
  async saveAssignment(assignment) {
    try {
      const assignments = LocalStorageManager.load('assignments') || [];
      
      if (assignment.id) {
        // Update existing
        const index = assignments.findIndex(a => a.id === assignment.id);
        if (index !== -1) {
          assignments[index] = assignment;
        }
      } else {
        // Create new
        assignment.id = Date.now().toString();
        assignment.createdAt = new Date().toISOString();
        assignments.push(assignment);
      }
      
      LocalStorageManager.save('assignments', assignments);
      
      // Queue for Firebase sync
      this.queueForSync('assignments', assignment, assignment.createdAt ? 'create' : 'update');
      
      return { success: true, assignment };
    } catch (error) {
      console.error('Error saving assignment:', error);
      return { success: false, error };
    }
  }

  // Backup and restore methods
  async createBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          assignments: LocalStorageManager.load('assignments') || [],
          studySessions: LocalStorageManager.load('studySessions') || [],
          studyGoals: LocalStorageManager.load('studyGoals') || {},
          dailyHours: LocalStorageManager.load('dailyHours') || {},
          monthlyHours: LocalStorageManager.load('monthlyHours') || {},
          subjectHours: LocalStorageManager.load('subjectHours') || {},
          flashcardSets: LocalStorageManager.load('flashcardSets') || [],
          settings: {
            darkMode: LocalStorageManager.load('darkMode'),
            blackoutMode: LocalStorageManager.load('blackoutMode'),
            currentTerm: LocalStorageManager.load('currentTerm')
          }
        }
      };
      
      // Save backup locally
      LocalStorageManager.save('backup_' + Date.now(), backup);
      
      // Queue for Firebase sync
      this.queueForSync('backups', backup, 'create');
      
      return { success: true, backup };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error };
    }
  }

  async restoreFromBackup(backupId) {
    try {
      const backup = LocalStorageManager.load('backup_' + backupId);
      
      if (!backup || !backup.data) {
        throw new Error('Invalid backup data');
      }
      
      // Restore all data
      Object.keys(backup.data).forEach(key => {
        if (key === 'settings') {
          Object.keys(backup.data.settings).forEach(settingKey => {
            if (backup.data.settings[settingKey] !== null) {
              LocalStorageManager.save(settingKey, backup.data.settings[settingKey]);
            }
          });
        } else {
          LocalStorageManager.save(key, backup.data[key]);
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { success: false, error };
    }
  }

  // Utility methods
  filterByDateRange(data, dateRange) {
    if (!Array.isArray(data)) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.timestamp || item.createdAt || item.date);
      return itemDate >= new Date(dateRange.from) && itemDate <= new Date(dateRange.to);
    });
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isInitialized: this.isInitialized,
      queueLength: this.syncQueue.length,
      lastSync: LocalStorageManager.load('lastSyncTime')
    };
  }
}

// Create global instance
window.FirebaseManager = new FirebaseManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirebaseManager;
}
