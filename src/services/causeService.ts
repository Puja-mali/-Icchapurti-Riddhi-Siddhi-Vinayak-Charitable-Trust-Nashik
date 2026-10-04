import { api } from './api';
import { Cause } from '../types';

export interface CauseListParams {
  category?: string;
  status?: string;
  search?: string;
  urgent?: boolean;
  isKumbhRelated?: boolean;
  page?: number;
  limit?: number;
}

export interface CauseListResponse {
  causes: Cause[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Normalizes a cause object returned from MongoDB to ensure complete compatibility
 * with all existing UI components (handling virtuals, missing fields, fallbacks).
 */
export const normalizeCause = (item: any): Cause => {
  const id = item.id || item._id?.toString() || item._id || '';
  const tagline = item.tagline || item.shortDescription || item.title || '';
  const shortDescription = item.shortDescription || item.tagline || item.title || '';

  return {
    ...item,
    id,
    _id: item._id?.toString() || id,
    slug: item.slug || id,
    title: item.title || 'Untitled Campaign',
    category: item.category || 'Other',
    tagline,
    shortDescription,
    description: item.description || '',
    targetAmount: Number(item.targetAmount) || 0,
    raisedAmount: Number(item.raisedAmount) || 0,
    donorCount: Number(item.donorCount) || 0,
    imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200',
    location: item.location || 'Maharashtra, India',
    urgent: !!item.urgent,
    featured: !!item.featured,
    isKumbhRelated: !!item.isKumbhRelated,
    status: item.status || 'ACTIVE',
    allocationBreakdown: Array.isArray(item.allocationBreakdown) ? item.allocationBreakdown : [],
    impactMilestones: Array.isArray(item.impactMilestones) ? item.impactMilestones : [],
    startDate: item.startDate ? new Date(item.startDate).toISOString() : undefined,
    endDate: item.endDate ? new Date(item.endDate).toISOString() : undefined,
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
    updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
  };
};

export const causeService = {
  /**
   * Fetch list of causes from backend API
   */
  async getCauses(params: CauseListParams = {}): Promise<CauseListResponse> {
    const query = new URLSearchParams();

    if (params.category && params.category !== 'All') {
      query.append('category', params.category);
    }
    if (params.status) {
      query.append('status', params.status);
    }
    if (params.search && params.search.trim()) {
      query.append('search', params.search.trim());
    }
    if (params.urgent !== undefined) {
      query.append('urgent', String(params.urgent));
    }
    if (params.isKumbhRelated !== undefined) {
      query.append('isKumbhRelated', String(params.isKumbhRelated));
    }
    if (params.page) {
      query.append('page', String(params.page));
    }
    if (params.limit) {
      query.append('limit', String(params.limit));
    }

    const queryString = query.toString();
    const endpoint = queryString ? `/causes?${queryString}` : '/causes';

    const response = await api.get<{ causes: any[]; pagination: any }>(endpoint);

    const rawCauses = response?.causes || [];
    const normalizedCauses = rawCauses.map(normalizeCause);

    return {
      causes: normalizedCauses,
      pagination: response?.pagination || {
        page: 1,
        limit: normalizedCauses.length,
        total: normalizedCauses.length,
        totalPages: 1,
      },
    };
  },

  /**
   * Fetch single cause by ID or Slug
   */
  async getCause(idOrSlug: string): Promise<Cause> {
    try {
      const response = await api.get<{ cause: any }>(`/causes/${encodeURIComponent(idOrSlug)}`);
      if (response?.cause) {
        return normalizeCause(response.cause);
      }
    } catch (err: any) {
      throw new Error(err?.message || `Campaign '${idOrSlug}' not found.`);
    }

    throw new Error(`Campaign '${idOrSlug}' not found.`);
  },

  /**
   * Admin: Create a new cause
   */
  async createCause(payload: Partial<Cause>): Promise<Cause> {
    const response = await api.post<{ cause: any }>('/causes', {
      title: payload.title,
      slug: payload.slug || undefined,
      shortDescription: payload.shortDescription || payload.tagline,
      description: payload.description,
      targetAmount: Number(payload.targetAmount),
      raisedAmount: Number(payload.raisedAmount) || 0,
      category: payload.category,
      imageUrl: payload.imageUrl,
      status: payload.status || 'ACTIVE',
      isKumbhRelated: !!payload.isKumbhRelated,
      startDate: payload.startDate || undefined,
      endDate: payload.endDate || undefined,
      location: payload.location || 'Maharashtra, India',
      urgent: !!payload.urgent,
      donorCount: Number(payload.donorCount) || 0,
      allocationBreakdown: payload.allocationBreakdown || [],
      impactMilestones: payload.impactMilestones || [],
    });

    return normalizeCause(response.cause);
  },

  /**
   * Admin: Update an existing cause
   */
  async updateCause(id: string, payload: Partial<Cause>): Promise<Cause> {
    const response = await api.patch<{ cause: any }>(`/causes/${encodeURIComponent(id)}`, {
      title: payload.title,
      slug: payload.slug || undefined,
      shortDescription: payload.shortDescription || payload.tagline,
      description: payload.description,
      targetAmount: payload.targetAmount !== undefined ? Number(payload.targetAmount) : undefined,
      raisedAmount: payload.raisedAmount !== undefined ? Number(payload.raisedAmount) : undefined,
      category: payload.category,
      imageUrl: payload.imageUrl,
      status: payload.status,
      isKumbhRelated: payload.isKumbhRelated,
      startDate: payload.startDate,
      endDate: payload.endDate,
      location: payload.location,
      urgent: payload.urgent,
      donorCount: payload.donorCount !== undefined ? Number(payload.donorCount) : undefined,
      allocationBreakdown: payload.allocationBreakdown,
      impactMilestones: payload.impactMilestones,
    });

    return normalizeCause(response.cause);
  },

  /**
   * Admin: Delete an existing cause
   */
  async deleteCause(id: string): Promise<void> {
    await api.delete(`/causes/${encodeURIComponent(id)}`);
  },
};
