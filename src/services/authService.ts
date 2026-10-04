/**
 * Siddhivinayak Charitable Trust - Authentication Service
 *
 * Direct communication bridge with backend /api/auth endpoints:
 * - POST /api/auth/register
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 * - GET  /api/auth/me
 */

import { api, setAccessToken, getAccessToken } from './api';

export type UserRole = 'ADMIN' | 'STAFF' | 'VOLUNTEER' | 'DONOR';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
  role: 'DONOR' | 'VOLUNTEER';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
  expiresIn: string;
}

export const authService = {
  /**
   * Register a new user (Strictly DONOR or VOLUNTEER)
   */
  async register(data: RegisterPayload): Promise<AuthResponseData> {
    const response = await api.post<AuthResponseData>('/auth/register', {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || '',
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
    });

    if (response?.accessToken) {
      setAccessToken(response.accessToken);
    }

    return response;
  },

  /**
   * Authenticate an existing user
   */
  async login(credentials: LoginPayload): Promise<AuthResponseData> {
    const response = await api.post<AuthResponseData>('/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password,
    });

    if (response?.accessToken) {
      setAccessToken(response.accessToken);
    }

    return response;
  },

  /**
   * Retrieve current user profile via short-lived token
   */
  async getMe(): Promise<AuthUser> {
    const response = await api.get<{ user: AuthUser }>('/auth/me');
    return response.user;
  },

  /**
   * Silent token refresh using HttpOnly cookie
   */
  async refreshToken(): Promise<string> {
    const response = await api.post<{ accessToken: string }>('/auth/refresh', {});
    if (response?.accessToken) {
      setAccessToken(response.accessToken);
      return response.accessToken;
    }
    throw new Error('Failed to retrieve new access token');
  },

  /**
   * Log out and clear refresh token cookies
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Inspect current in-memory access token state
   */
  hasToken(): boolean {
    return !!getAccessToken();
  },
};
