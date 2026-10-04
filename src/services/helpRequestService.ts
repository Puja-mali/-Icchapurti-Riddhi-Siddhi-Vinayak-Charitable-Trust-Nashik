import { api } from './api';
import { HelpRequest, HelpRequestType, HelpUrgency, HelpRequestStatus } from '../types';

export interface CreateHelpRequestData {
  name: string;
  email: string;
  phone: string;
  requestType: HelpRequestType;
  description: string;
  location: string;
  urgency?: HelpUrgency;
}

export interface AdminHelpRequestParams {
  page?: number;
  limit?: number;
  status?: HelpRequestStatus | 'ALL';
  requestType?: HelpRequestType | 'ALL';
  urgency?: HelpUrgency | 'ALL';
  search?: string;
}

export interface AdminHelpRequestMetrics {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export interface AdminHelpRequestListResponse {
  requests: HelpRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  metrics?: AdminHelpRequestMetrics;
}

export interface UpdateAdminHelpRequestData {
  status?: HelpRequestStatus;
  adminNotes?: string;
  assignedTo?: string | null;
  urgency?: HelpUrgency;
}

export const normalizeHelpRequest = (raw: any): HelpRequest => {
  if (!raw) {
    throw new Error('Invalid help request payload');
  }

  const id = raw.id || (raw._id ? (typeof raw._id === 'object' ? raw._id.toString() : String(raw._id)) : '');

  return {
    id,
    requesterId: raw.requesterId,
    name: raw.name || '',
    email: raw.email || '',
    phone: raw.phone || '',
    requestType: raw.requestType || 'Other',
    description: raw.description || '',
    location: raw.location || '',
    urgency: raw.urgency || 'MEDIUM',
    status: raw.status || 'PENDING',
    adminNotes: raw.adminNotes || '',
    assignedTo: raw.assignedTo || null,
    reviewedBy: raw.reviewedBy || null,
    reviewedAt: raw.reviewedAt || undefined,
    resolvedAt: raw.resolvedAt || undefined,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

export const helpRequestService = {
  /**
   * Submit a new hardship/help request (authenticated)
   */
  async createHelpRequest(data: CreateHelpRequestData): Promise<HelpRequest> {
    const response = await api.post<{ helpRequest: any }>('/help-requests', data);
    return normalizeHelpRequest(response.helpRequest);
  },

  /**
   * Get all personal requests submitted by the logged-in user
   */
  async getMyHelpRequests(): Promise<HelpRequest[]> {
    const response = await api.get<{ helpRequests: any[] }>('/help-requests/my');
    return (response.helpRequests || []).map(normalizeHelpRequest);
  },

  /**
   * Get single request with IDOR check
   */
  async getHelpRequestById(id: string): Promise<HelpRequest> {
    const response = await api.get<{ helpRequest: any }>(`/help-requests/${id}`);
    return normalizeHelpRequest(response.helpRequest);
  },

  /**
   * Admin: List all requests with filters, search, and metrics
   */
  async getAdminHelpRequests(params: AdminHelpRequestParams = {}): Promise<AdminHelpRequestListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.requestType && params.requestType !== 'ALL') query.append('requestType', params.requestType);
    if (params.urgency && params.urgency !== 'ALL') query.append('urgency', params.urgency);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());

    const queryString = query.toString();
    const endpoint = `/help-requests/admin/all${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<{
      requests: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      metrics?: AdminHelpRequestMetrics;
    }>(endpoint);

    return {
      requests: (response.requests || []).map(normalizeHelpRequest),
      pagination: response.pagination || {
        page: params.page || 1,
        limit: params.limit || 20,
        total: 0,
        totalPages: 0,
      },
      metrics: response.metrics,
    };
  },

  /**
   * Admin: Get single request details by ID
   */
  async getAdminHelpRequestById(id: string): Promise<HelpRequest> {
    const response = await api.get<{ helpRequest: any }>(`/help-requests/admin/${id}`);
    return normalizeHelpRequest(response.helpRequest);
  },

  /**
   * Admin: Update status, admin notes, urgency, assignment
   */
  async updateAdminHelpRequest(
    id: string,
    data: UpdateAdminHelpRequestData
  ): Promise<HelpRequest> {
    const response = await api.patch<{ helpRequest: any }>(`/help-requests/admin/${id}`, data);
    return normalizeHelpRequest(response.helpRequest);
  },

  /**
   * Admin: Delete request permanently
   */
  async deleteAdminHelpRequest(id: string): Promise<void> {
    await api.delete(`/help-requests/admin/${id}`);
  },
};
