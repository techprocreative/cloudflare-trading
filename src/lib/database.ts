import { createDB } from './db';
import { useAuth } from './auth-context';
import type { AuthUser } from './auth';
import { SubscriptionManager } from './subscription';

// Database service for production-ready data persistence
export class DatabaseService {
  private static instance: DatabaseService;

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Save user session data to persistent storage
  async saveUserSession(userId: string, sessionData: any): Promise<void> {
    try {
      // In production, this would save to Cloudflare KV or D1
      localStorage.setItem(`user_session_${userId}`, JSON.stringify({
        ...sessionData,
        lastUpdated: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      }));
    } catch (error) {
      console.error('Failed to save user session:', error);
    }
  }

  // Load user session data
  async loadUserSession(userId: string): Promise<any | null> {
    try {
      const stored = localStorage.getItem(`user_session_${userId}`);
      if (!stored) return null;

      const sessionData = JSON.parse(stored);
      const expiresAt = new Date(sessionData.expiresAt);
      
      if (expiresAt < new Date()) {
        // Session expired, remove it
        localStorage.removeItem(`user_session_${userId}`);
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Failed to load user session:', error);
      return null;
    }
  }

  // Save user portfolio data
  async saveUserPortfolio(userId: string, portfolioData: any): Promise<void> {
    try {
      localStorage.setItem(`user_portfolio_${userId}`, JSON.stringify({
        ...portfolioData,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save portfolio:', error);
    }
  }

  // Load user portfolio data
  async loadUserPortfolio(userId: string): Promise<any | null> {
    try {
      const stored = localStorage.getItem(`user_portfolio_${userId}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      return null;
    }
  }

  // Save user watchlist
  async saveUserWatchlist(userId: string, watchlist: string[]): Promise<void> {
    try {
      localStorage.setItem(`user_watchlist_${userId}`, JSON.stringify({
        symbols: watchlist,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save watchlist:', error);
    }
  }

  // Load user watchlist
  async loadUserWatchlist(userId: string): Promise<string[]> {
    try {
      const stored = localStorage.getItem(`user_watchlist_${userId}`);
      if (!stored) return [];
      
      const watchlistData = JSON.parse(stored);
      return watchlistData.symbols || [];
    } catch (error) {
      console.error('Failed to load watchlist:', error);
      return [];
    }
  }

  // Save user learning progress
  async saveUserProgress(userId: string, progressData: any): Promise<void> {
    try {
      localStorage.setItem(`user_progress_${userId}`, JSON.stringify({
        ...progressData,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  // Load user learning progress
  async loadUserProgress(userId: string): Promise<any> {
    try {
      const stored = localStorage.getItem(`user_progress_${userId}`);
      return stored ? JSON.parse(stored) : {
        coursesCompleted: [],
        lessonsCompleted: [],
        quizzesCompleted: [],
        totalLearningTime: 0
      };
    } catch (error) {
      console.error('Failed to load progress:', error);
      return {
        coursesCompleted: [],
        lessonsCompleted: [],
        quizzesCompleted: [],
        totalLearningTime: 0
      };
    }
  }

  // Save signal history for user
  async saveSignalHistory(userId: string, signalHistory: any[]): Promise<void> {
    try {
      localStorage.setItem(`signal_history_${userId}`, JSON.stringify({
        signals: signalHistory.slice(0, 100), // Keep last 100 signals
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save signal history:', error);
    }
  }

  // Load signal history for user
  async loadSignalHistory(userId: string): Promise<any[]> {
    try {
      const stored = localStorage.getItem(`signal_history_${userId}`);
      if (!stored) return [];
      
      const historyData = JSON.parse(stored);
      return historyData.signals || [];
    } catch (error) {
      console.error('Failed to load signal history:', error);
      return [];
    }
  }

  // Save user preferences
  async saveUserPreferences(userId: string, preferences: any): Promise<void> {
    try {
      localStorage.setItem(`user_preferences_${userId}`, JSON.stringify({
        ...preferences,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  // Load user preferences
  async loadUserPreferences(userId: string): Promise<any> {
    try {
      const stored = localStorage.getItem(`user_preferences_${userId}`);
      return stored ? JSON.parse(stored) : {
        theme: 'dark',
        language: 'id',
        notifications: true,
        emailNotifications: true,
        marketAlerts: true,
        defaultChartTimeframe: '1d'
      };
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {
        theme: 'dark',
        language: 'id',
        notifications: true,
        emailNotifications: true,
        marketAlerts: true,
        defaultChartTimeframe: '1d'
      };
    }
  }

  // Save user analytics data
  async saveUserAnalytics(userId: string, analyticsData: any): Promise<void> {
    try {
      localStorage.setItem(`user_analytics_${userId}`, JSON.stringify({
        ...analyticsData,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  // Load user analytics data
  async loadUserAnalytics(userId: string): Promise<any> {
    try {
      const stored = localStorage.getItem(`user_analytics_${userId}`);
      return stored ? JSON.parse(stored) : {
        totalSignalsGenerated: 0,
        totalAIRequests: 0,
        averageConfidenceScore: 0,
        bestPerformingSymbols: [],
        tradingGoalsAchieved: 0,
        learningModulesCompleted: 0,
        weeklyActiveDays: 0,
        lastActiveAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to load analytics:', error);
      return {
        totalSignalsGenerated: 0,
        totalAIRequests: 0,
        averageConfidenceScore: 0,
        bestPerformingSymbols: [],
        tradingGoalsAchieved: 0,
        learningModulesCompleted: 0,
        weeklyActiveDays: 0,
        lastActiveAt: new Date().toISOString()
      };
    }
  }

  // Update analytics after user action
  async updateAnalytics(userId: string, action: string, data?: any): Promise<void> {
    try {
      const currentAnalytics = await this.loadUserAnalytics(userId);
      const now = new Date().toISOString();

      switch (action) {
        case 'ai_request':
          currentAnalytics.totalAIRequests += 1;
          if (data?.confidence) {
            // Update running average
            currentAnalytics.averageConfidenceScore = 
              (currentAnalytics.averageConfidenceScore * (currentAnalytics.totalAIRequests - 1) + data.confidence) / currentAnalytics.totalAIRequests;
          }
          break;
        
        case 'signal_generated':
          currentAnalytics.totalSignalsGenerated += 1;
          if (data?.symbol && !currentAnalytics.bestPerformingSymbols.includes(data.symbol)) {
            currentAnalytics.bestPerformingSymbols.push(data.symbol);
            // Keep only top 10
            if (currentAnalytics.bestPerformingSymbols.length > 10) {
              currentAnalytics.bestPerformingSymbols = currentAnalytics.bestPerformingSymbols.slice(-10);
            }
          }
          break;
        
        case 'lesson_completed':
          currentAnalytics.learningModulesCompleted += 1;
          break;
        
        case 'goal_achieved':
          currentAnalytics.tradingGoalsAchieved += 1;
          break;
      }

      currentAnalytics.lastActiveAt = now;

      await this.saveUserAnalytics(userId, currentAnalytics);
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  }

  // Clear all user data (for logout/signout)
  async clearUserData(userId: string): Promise<void> {
    try {
      const keys = [
        `user_session_${userId}`,
        `user_portfolio_${userId}`,
        `user_watchlist_${userId}`,
        `user_progress_${userId}`,
        `signal_history_${userId}`,
        `user_preferences_${userId}`,
        `user_analytics_${userId}`
      ];

      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  // Export user data (GDPR compliance)
  async exportUserData(userId: string): Promise<any> {
    try {
      const userData = {
        profile: await this.loadUserPreferences(userId),
        portfolio: await this.loadUserPortfolio(userId),
        watchlist: await this.loadUserWatchlist(userId),
        progress: await this.loadUserProgress(userId),
        signalHistory: await this.loadSignalHistory(userId),
        analytics: await this.loadUserAnalytics(userId),
        exportDate: new Date().toISOString()
      };

      return userData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  // Get storage usage statistics
  getStorageStats(userId: string): { used: number; available: number; percentage: number } {
    try {
      const keys = [
        `user_session_${userId}`,
        `user_portfolio_${userId}`,
        `user_watchlist_${userId}`,
        `user_progress_${userId}`,
        `signal_history_${userId}`,
        `user_preferences_${userId}`,
        `user_analytics_${userId}`
      ];

      let usedBytes = 0;
      keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          usedBytes += item.length + key.length; // Include key length
        }
      });

      // LocalStorage typically has ~5-10MB limit
      const availableBytes = 5 * 1024 * 1024; // 5MB conservative estimate
      const percentage = (usedBytes / availableBytes) * 100;

      return {
        used: Math.round(usedBytes / 1024), // KB
        available: Math.round(availableBytes / 1024), // KB
        percentage: Math.round(percentage * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { used: 0, available: 5000, percentage: 0 };
    }
  }
}

// React hook for database operations
export function useDatabase() {
  const { user } = useAuth();
  const dbService = DatabaseService.getInstance();

  return {
    // Session management
    saveSession: (data: any) => user?.user?.id && dbService.saveUserSession(user.user.id, data),
    loadSession: () => user?.user?.id && dbService.loadUserSession(user.user.id),

    // Portfolio management
    savePortfolio: (data: any) => user?.user?.id && dbService.saveUserPortfolio(user.user.id, data),
    loadPortfolio: () => user?.user?.id && dbService.loadUserPortfolio(user.user.id),

    // Watchlist management
    saveWatchlist: (watchlist: string[]) => user?.user?.id && dbService.saveUserWatchlist(user.user.id, watchlist),
    loadWatchlist: () => user?.user?.id && dbService.loadUserWatchlist(user.user.id),

    // Learning progress
    saveProgress: (progress: any) => user?.user?.id && dbService.saveUserProgress(user.user.id, progress),
    loadProgress: () => user?.user?.id && dbService.loadUserProgress(user.user.id),

    // Signal history
    saveSignalHistory: (history: any[]) => user?.user?.id && dbService.saveSignalHistory(user.user.id, history),
    loadSignalHistory: () => user?.user?.id && dbService.loadSignalHistory(user.user.id),

    // User preferences
    savePreferences: (prefs: any) => user?.user?.id && dbService.saveUserPreferences(user.user.id, prefs),
    loadPreferences: () => user?.user?.id && dbService.loadUserPreferences(user.user.id),

    // Analytics
    saveAnalytics: (data: any) => user?.user?.id && dbService.saveUserAnalytics(user.user.id, data),
    loadAnalytics: () => user?.user?.id && dbService.loadUserAnalytics(user.user.id),
    updateAnalytics: (action: string, data?: any) => user?.user?.id && dbService.updateAnalytics(user.user.id, action, data),

    // Data management
    clearUserData: () => user?.user?.id && dbService.clearUserData(user.user.id),
    exportUserData: () => user?.user?.id && dbService.exportUserData(user.user.id),
    getStorageStats: () => user?.user?.id && dbService.getStorageStats(user.user.id)
  };
}