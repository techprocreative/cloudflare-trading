import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthUser } from './auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string, phone?: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const rememberMe = localStorage.getItem('authToken') !== null;
      
      if (token) {
        const userData = await getCurrentUser(token);
        if (userData) {
          setUser(userData);
        } else {
          // Token invalid, clear storage
          clearAuthStorage();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authUser');
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const userData = await login(email, password);
      setUser(userData);
      
      // Store token based on remember me preference
      const token = generateMockToken(userData.user.id);
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('authToken', token);
      storage.setItem('authUser', JSON.stringify(userData));
      
      // Auto refresh token setup
      setupTokenRefresh(rememberMe ? 'local' : 'session');
      
      console.log('Sign in successful:', userData.user.email);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const userData = await register(email, password, fullName, phone);
      setUser(userData);
      
      // Auto login after successful registration
      const token = generateMockToken(userData.user.id);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Setup token refresh for persistent session
      setupTokenRefresh('local');
      
      console.log('Sign up successful:', userData.user.email);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    clearAuthStorage();
    console.log('Sign out successful');
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        const userData = await getCurrentUser(token);
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('User refresh failed:', error);
      // If refresh fails, sign out
      signOut();
    }
  };

  const setupTokenRefresh = (storageType: 'local' | 'session') => {
    // Refresh token every 30 minutes
    setTimeout(async () => {
      try {
        const token = storageType === 'local' ? localStorage.getItem('authToken') : sessionStorage.getItem('authToken');
        if (token) {
          const newUserData = await refreshToken(token);
          if (newUserData) {
            const storage = storageType === 'local' ? localStorage : sessionStorage;
            storage.setItem('authUser', JSON.stringify(newUserData));
            setUser(newUserData);
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        signOut();
      }
    }, 30 * 60 * 1000); // 30 minutes
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Mock authentication functions for development
// In production, these would call your actual backend APIs

// Browser-compatible base64 encoding function
const encodeToBase64 = (str: string): string => {
  return btoa(str);
};

const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

const login = async (email: string, password: string): Promise<AuthUser> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation - accept any email/password for development
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  // Check if email format is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  // Mock user data
  const userId = `user_${encodeToBase64(email).slice(0, 8)}`;
  const now = new Date();
  
  const mockUser = {
    user: {
      id: userId,
      email,
      fullName: email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      phone: null,
      subscriptionTier: 'free' as const,
      createdAt: now,
      lastLogin: now,
    },
    profile: {
      userId,
      riskProfile: null,
      experienceLevel: null,
      preferredLanguage: 'id',
      timezone: 'Asia/Jakarta',
    },
    subscription: {
      id: `sub_${userId}`,
      userId,
      tier: 'free',
      status: 'active',
      startedAt: now,
      expiresAt: null,
      autoRenew: false,
      cryptoAddress: null,
      cryptoCurrency: null,
    },
  };
  
  return mockUser;
};

const register = async (email: string, password: string, fullName?: string, phone?: string): Promise<AuthUser> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock validation
  if (!email || !password || !fullName) {
    throw new Error('Email, password, and full name are required');
  }
  
  // Check if email format is valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  
  // Check if user already exists (mock check)
  const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  if (existingUsers.includes(email)) {
    throw new Error('Email already exists');
  }
  
  // Save to mock database
  existingUsers.push(email);
  localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
  
  const userId = `user_${encodeToBase64(email).slice(0, 8)}`;
  const now = new Date();
  
  const mockUser = {
    user: {
      id: userId,
      email,
      fullName,
      phone: phone || null,
      subscriptionTier: 'free' as const,
      createdAt: now,
      lastLogin: now,
    },
    profile: {
      userId,
      riskProfile: null,
      experienceLevel: null,
      preferredLanguage: 'id',
      timezone: 'Asia/Jakarta',
    },
    subscription: {
      id: `sub_${userId}`,
      userId,
      tier: 'free',
      status: 'active',
      startedAt: now,
      expiresAt: null,
      autoRenew: false,
      cryptoAddress: null,
      cryptoCurrency: null,
    },
  };
  
  return mockUser;
};

const getCurrentUser = async (token: string): Promise<AuthUser | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if token is valid mock token
  if (!token.startsWith('mock_token_')) {
    return null;
  }
  
  // Get user data from storage
  const storage = localStorage.getItem('authToken') === token ? localStorage : sessionStorage;
  const userData = storage.getItem('authUser');
  
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  }
  
  return null;
};

const refreshToken = async (token: string): Promise<AuthUser | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would call your backend to refresh the token
  return getCurrentUser(token);
};