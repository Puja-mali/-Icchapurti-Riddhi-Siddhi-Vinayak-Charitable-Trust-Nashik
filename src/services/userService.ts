import { api } from './api';
import { UserRole } from './authService';

export interface UserSummary {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InvitationItem {
  _id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'STAFF';
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  invitedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

export interface CreateInvitationResponse {
  invitation: InvitationItem;
  emailSent: boolean;
  invitationUrl?: string;
  smtpWarning?: string;
}

export interface ValidateInvitationResponse {
  valid: boolean;
  email: string;
  name?: string;
  role: 'ADMIN' | 'STAFF';
  expiresAt: string;
}

export const userService = {
  /**
   * List and search users with pagination (ADMIN only)
   */
  async listUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{ users: UserSummary[]; pagination: UserPagination }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.role && params.role !== 'ALL') query.set('role', params.role);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await api.get<{ users: UserSummary[]; pagination: UserPagination }>(
      `/users?${query.toString()}`
    );
    return res || { users: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  },

  /**
   * Activate or Deactivate user account (ADMIN only)
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<UserSummary> {
    const res = await api.patch<{ user: UserSummary }>(`/users/${id}/status`, { isActive });
    return res.user;
  },

  /**
   * Assign or promote user role (ADMIN only)
   */
  async updateUserRole(id: string, role: UserRole): Promise<UserSummary> {
    const res = await api.patch<{ user: UserSummary }>(`/users/${id}/role`, { role });
    return res.user;
  },

  /**
   * List all invitations (ADMIN only)
   */
  async listInvitations(params?: { page?: number; limit?: number }): Promise<{
    invitations: InvitationItem[];
    pagination: UserPagination;
  }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await api.get<{ invitations: InvitationItem[]; pagination: UserPagination }>(
      `/invitations?${query.toString()}`
    );
    return res || { invitations: [], pagination: { page: 1, limit: 30, total: 0, totalPages: 0 } };
  },

  /**
   * Create and send invitation for ADMIN or STAFF (ADMIN only)
   */
  async createInvitation(payload: {
    email: string;
    name?: string;
    role: 'ADMIN' | 'STAFF';
  }): Promise<CreateInvitationResponse> {
    const res = await api.post<CreateInvitationResponse>('/invitations', payload);
    return res;
  },

  /**
   * Resend an invitation with refreshed token & 72h expiry (ADMIN only)
   */
  async resendInvitation(id: string): Promise<CreateInvitationResponse> {
    const res = await api.post<CreateInvitationResponse>(`/invitations/${id}/resend`);
    return res;
  },

  /**
   * Revoke an active invitation (ADMIN only)
   */
  async revokeInvitation(id: string): Promise<void> {
    await api.delete(`/invitations/${id}`);
  },

  /**
   * Public validation of invitation token prior to showing activation form
   */
  async validateInvitation(token: string): Promise<ValidateInvitationResponse> {
    const res = await api.get<ValidateInvitationResponse>(`/invitations/validate/${encodeURIComponent(token)}`);
    return res;
  },

  /**
   * Public acceptance of invitation and setting account password
   */
  async acceptInvitation(payload: {
    token: string;
    password: string;
    name?: string;
  }): Promise<{ user: { _id: string; name: string; email: string; role: string } }> {
    const res = await api.post<{ user: { _id: string; name: string; email: string; role: string } }>(
      '/invitations/accept',
      payload
    );
    return res;
  },
};
