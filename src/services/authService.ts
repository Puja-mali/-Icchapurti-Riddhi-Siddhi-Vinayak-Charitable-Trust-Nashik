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

export const VALID_ROLES: readonly UserRole[] = ['ADMIN', 'STAFF', 'VOLUNTEER', 'DONOR'] as const;

export const isValidUserRole = (role: unknown): role is UserRole => {
  return typeof role === 'string' && VALID_ROLES.includes(role as UserRole);
};

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

export const isValidAuthUser = (candidate: unknown): candidate is AuthUser => {
  if (!candidate || typeof candidate !== 'object') return false;
  const obj = candidate as Record<string, unknown>;
  const id = obj.id || obj._id;
  if (!id || typeof id !== 'string') return false;
  if (typeof obj.email !== 'string' || !obj.email.includes('@')) return false;
  if (!isValidUserRole(obj.role)) return false;
  return true;
};

export const normalizeAuthUser = (candidate: any): AuthUser => {
  if (!candidate || !isValidUserRole(candidate.role)) {
    throw new Error(`Authentication identity error: Unresolved or invalid role '${candidate?.role}'.`);
  }
  return {
    id: String(candidate.id || candidate._id || ''),
    name: typeof candidate.name === 'string' && candidate.name.trim() ? candidate.name.trim() : 'Trust Member',
    email: String(candidate.email || '').toLowerCase().trim(),
    phone: typeof candidate.phone === 'string' ? candidate.phone : undefined,
    role: candidate.role,
    isActive: candidate.isActive !== false,
    isEmailVerified: Boolean(candidate.isEmailVerified),
    createdAt: candidate.createdAt ? String(candidate.createdAt) : undefined,
  };
};

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
  portal?: 'public' | 'admin';
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
    const response = await api.post<any>('/auth/register', {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone?.trim() || '',
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
    });

    const rawUser = response?.user || response?.data?.user;
    if (!rawUser || !isValidAuthUser(rawUser)) {
      throw new Error('Registration failed: Server did not return a valid user identity.');
    }

    const token = response?.accessToken || response?.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }

    return {
      user: normalizeAuthUser(rawUser),
      accessToken: token || '',
      expiresIn: response?.expiresIn || response?.data?.expiresIn || '15m',
    };
  },

  /**
   * Authenticate an existing user
   */
  async login(credentials: LoginPayload): Promise<AuthResponseData> {
    const payload: Record<string, any> = {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password,
    };
    if (credentials.portal) {
      payload.portal = credentials.portal;
    }

    const response = await api.post<any>('/auth/login', payload);

    const rawUser = response?.user || response?.data?.user;
    if (!rawUser || !isValidAuthUser(rawUser)) {
      throw new Error('Authentication failed: Server did not return a valid user identity.');
    }

    const token = response?.accessToken || response?.data?.accessToken;
    if (token) {
      setAccessToken(token);
    }

    return {
      user: normalizeAuthUser(rawUser),
      accessToken: token || '',
      expiresIn: response?.expiresIn || response?.data?.expiresIn || '15m',
    };
  },

  /**
   * Retrieve current user profile via short-lived token
   */
  async getMe(): Promise<AuthUser | null> {
    const response = await api.get<any>('/auth/me');
    if (!response) {
      return null;
    }
    const rawUser = response?.user || response?.data?.user || (isValidAuthUser(response) ? response : null);
    if (!rawUser || !isValidAuthUser(rawUser)) {
      return null;
    }
    return normalizeAuthUser(rawUser);
  },

  /**
   * Silent token refresh using HttpOnly cookie
   */
  async refreshToken(): Promise<string> {
    const response = await api.post<any>('/auth/refresh', {});
    const token = response?.accessToken || response?.data?.accessToken;
    if (token) {
      setAccessToken(token);
      return token;
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
   * Safely update password for current authenticated user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Request password reset email for forgotten credentials
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>('/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    });
  },

  /**
   * Validate password reset token
   */
  async validateResetToken(token: string): Promise<{ valid: boolean; email: string; role?: string }> {
    return api.get<{ valid: boolean; email: string; role?: string }>(`/auth/reset-password/validate/${encodeURIComponent(token)}`);
  },

  /**
   * Reset password using single-use token
   */
  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>('/auth/reset-password', {
      token: token.trim(),
      password,
    });
  },

  /**
   * Inspect current in-memory access token state
   */
  hasToken(): boolean {
    return !!getAccessToken();
  },
};
