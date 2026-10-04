import { api } from './api';
import { TrustProfile, Trustee } from '../types';

export const normalizeTrustProfile = (raw: any): TrustProfile => {
  if (!raw) {
    throw new Error('Invalid trust profile payload');
  }

  const id = raw.id || (raw._id ? (typeof raw._id === 'object' ? raw._id.toString() : String(raw._id)) : '');

  return {
    id,
    _id: id,
    trustName: raw.trustName || 'Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik',
    shortName: raw.shortName || 'Icchapurti Vinayak Trust',
    subtitle: raw.subtitle || 'Reg. No. E-9389 / Nashik • Dedicated to Grassroots Social Welfare',
    description: raw.description || '',
    vision: raw.vision || '',
    mission: raw.mission || '',
    objectives: Array.isArray(raw.objectives)
      ? raw.objectives.map((obj: any) => ({
          title: obj.title || '',
          description: obj.description || '',
          category: obj.category || '',
        }))
      : [],
    address: raw.address || '',
    phone: raw.phone || '',
    email: raw.email || '',
    officeHours: raw.officeHours || '',
    website: raw.website || '',
    socialLinks: {
      facebook: raw.socialLinks?.facebook || '',
      twitter: raw.socialLinks?.twitter || '',
      instagram: raw.socialLinks?.instagram || '',
      linkedin: raw.socialLinks?.linkedin || '',
      youtube: raw.socialLinks?.youtube || '',
      github: raw.socialLinks?.github || '',
    },
    registrationDetails: {
      registrationNumber: raw.registrationDetails?.registrationNumber || '',
      establishedYear: raw.registrationDetails?.establishedYear || '',
      taxExemption80G: raw.registrationDetails?.taxExemption80G || '',
      fcraNumber: raw.registrationDetails?.fcraNumber || '',
      entityType: raw.registrationDetails?.entityType || 'Charitable Trust',
    },
    logo: raw.logo || '',
    academicNote: raw.academicNote || '',
    updatedBy: raw.updatedBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const normalizeTrustee = (raw: any): Trustee => {
  if (!raw) {
    throw new Error('Invalid trustee payload');
  }

  const id = raw.id || (raw._id ? (typeof raw._id === 'object' ? raw._id.toString() : String(raw._id)) : '');

  return {
    id,
    _id: id,
    name: raw.name || '',
    designation: raw.designation || '',
    role: raw.role || 'Trustee',
    bio: raw.bio || '',
    qualification: raw.qualification || '',
    photo: raw.photo || '',
    displayOrder: typeof raw.displayOrder === 'number' ? raw.displayOrder : 0,
    isActive: raw.isActive !== false,
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const trustService = {
  // ==========================================
  // PUBLIC QUERIES
  // ==========================================

  /**
   * Fetch public trust profile
   */
  async getPublicTrustProfile(): Promise<TrustProfile | null> {
    try {
      const response = await api.get<{ trust: any }>('/trust');
      if (response?.trust) {
        return normalizeTrustProfile(response.trust);
      }
      return null;
    } catch (error) {
      console.warn('Error fetching public trust profile:', error);
      return null;
    }
  },

  /**
   * Fetch public active trustees
   */
  async getPublicTrustees(): Promise<Trustee[]> {
    try {
      const response = await api.get<{ trustees: any[] }>('/trustees');
      if (Array.isArray(response?.trustees)) {
        return response.trustees.map(normalizeTrustee);
      }
      return [];
    } catch (error) {
      console.warn('Error fetching public trustees:', error);
      return [];
    }
  },

  // ==========================================
  // ADMIN OPERATIONS
  // ==========================================

  /**
   * Admin: Fetch complete trust profile
   */
  async getAdminTrustProfile(): Promise<TrustProfile | null> {
    const response = await api.get<{ trust: any }>('/trust/admin');
    if (response?.trust) {
      return normalizeTrustProfile(response.trust);
    }
    return null;
  },

  /**
   * Admin: Update organization trust profile
   */
  async updateAdminTrustProfile(data: Partial<TrustProfile>): Promise<TrustProfile> {
    const response = await api.patch<{ trust: any }>('/trust/admin', data);
    if (!response?.trust) {
      throw new Error('Failed to update trust profile');
    }
    return normalizeTrustProfile(response.trust);
  },

  /**
   * Admin: Fetch all trustees (active and inactive)
   */
  async getAdminTrustees(params?: { isActive?: string; search?: string }): Promise<Trustee[]> {
    const query = new URLSearchParams();
    if (params?.isActive) query.append('isActive', params.isActive);
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString();
    const endpoint = `/trustees/admin${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<{ trustees: any[] }>(endpoint);
    if (Array.isArray(response?.trustees)) {
      return response.trustees.map(normalizeTrustee);
    }
    return [];
  },

  /**
   * Admin: Create a new trustee
   */
  async createTrustee(data: Partial<Trustee>): Promise<Trustee> {
    const response = await api.post<{ trustee: any }>('/trustees/admin', data);
    if (!response?.trustee) {
      throw new Error('Failed to create trustee');
    }
    return normalizeTrustee(response.trustee);
  },

  /**
   * Admin: Update an existing trustee
   */
  async updateTrustee(id: string, data: Partial<Trustee>): Promise<Trustee> {
    const response = await api.patch<{ trustee: any }>(`/trustees/admin/${id}`, data);
    if (!response?.trustee) {
      throw new Error('Failed to update trustee');
    }
    return normalizeTrustee(response.trustee);
  },

  /**
   * Admin: Delete a trustee
   */
  async deleteTrustee(id: string): Promise<void> {
    await api.delete(`/trustees/admin/${id}`);
  },
};
