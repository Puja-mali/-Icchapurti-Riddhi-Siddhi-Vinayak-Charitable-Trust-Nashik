/**
 * Siddhivinayak Charitable Trust - Authentication Context & Provider
 *
 * Maintains global authentication state:
 * - Current real user (from MongoDB via /api/auth/me)
 * - Loading status during app initialization and auth operations
 * - Session restoration on app startup via HttpOnly refresh cookie
 * - Zero fake/mock users or tokens
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, AuthUser, RegisterPayload, LoginPayload, isValidAuthUser } from '../services/authService';
import { setAccessToken } from '../services/api';

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and check authentication on startup
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // If the browser has never recorded an active session, remain as guest immediately
      const hasActiveSession = typeof window !== 'undefined' && localStorage.getItem('sct_auth_active') === 'true';
      if (!hasActiveSession) {
        if (isMounted) {
          setUser(null);
          setAccessToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        // Attempt silent refresh using secure HttpOnly cookie
        await authService.refreshToken();
        const currentUser = await authService.getMe();
        if (isMounted && currentUser && isValidAuthUser(currentUser)) {
          setUser(currentUser);
        } else if (isMounted) {
          localStorage.removeItem('sct_auth_active');
          setUser(null);
          setAccessToken(null);
        }
      } catch {
        // Not authenticated or session expired - guest state
        if (isMounted) {
          localStorage.removeItem('sct_auth_active');
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const user = response?.user;
      if (!user || !isValidAuthUser(user)) {
        throw new Error('Authentication failed: Server did not return valid user credentials.');
      }
      localStorage.setItem('sct_auth_active', 'true');
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      const user = response?.user;
      if (!user || !isValidAuthUser(user)) {
        throw new Error('Registration failed: Server did not return valid user credentials.');
      }
      localStorage.setItem('sct_auth_active', 'true');
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('sct_auth_active');
      localStorage.removeItem('sct_user_role');
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    try {
      const updatedUser = await authService.getMe();
      if (updatedUser && isValidAuthUser(updatedUser)) {
        setUser(updatedUser);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    } catch {
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
