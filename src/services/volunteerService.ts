import { api } from './api';
import { VolunteerRole, VolunteerShift, VolunteerCertificate } from '../types';

export interface VolunteerApplicationInput {
  roleId?: string;
  roleTitle: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  isCollegeStudent?: boolean;
  collegeName?: string;
  availability?: string;
  skills?: string[];
  motivation?: string;
  isKumbhRelated?: boolean;
  preferredSevaArea?: string;
  emergencyContact?: string;
}

export interface LogShiftInput {
  roleTitle: string;
  date: string;
  hours: number;
  location: string;
  notes?: string;
  eventId?: string;
}

export interface VolunteerProfileData {
  volunteer: {
    _id: string;
    volunteerCode: string;
    status: string;
    tier: string;
    totalHours: number;
    shiftsCompleted: number;
    primaryFocus?: string;
    skills: string[];
    availability: string;
    isKumbhRegistered: boolean;
    user?: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      city?: string;
    };
  };
  shifts: VolunteerShift[];
  certificates: VolunteerCertificate[];
  stats: {
    totalHours: number;
    shiftsCompleted: number;
    certificatesCount: number;
    tier: string;
  };
}

export const volunteerService = {
  /**
   * Public: List all active volunteer opportunities
   */
  async getVolunteerRoles(params?: { isKumbhRelated?: boolean }): Promise<VolunteerRole[]> {
    const query = params?.isKumbhRelated !== undefined
      ? `?isKumbhRelated=${params.isKumbhRelated}`
      : '';
    const res = await api.get<{ roles: VolunteerRole[] }>(`/volunteers/roles${query}`);
    const rawRoles = (res as any)?.roles || (res as any)?.data?.roles || [];
    return rawRoles.map((r: any) => ({
      ...r,
      id: r._id || r.id,
    }));
  },

  /**
   * Public: Submit volunteer application to real MongoDB
   */
  async applyForVolunteerRole(payload: VolunteerApplicationInput): Promise<any> {
    const res = await api.post<{ application: any }>('/volunteers/apply', payload);
    return (res as any)?.application || (res as any)?.data?.application;
  },

  /**
   * Volunteer Only: Fetch authenticated volunteer profile, shifts, certificates, and stats
   */
  async getMyVolunteerProfile(): Promise<VolunteerProfileData> {
    const res = await api.get<VolunteerProfileData>('/volunteers/me');
    const profile: VolunteerProfileData = (res as any)?.volunteer ? res : (res as any)?.data;
    if (!profile) {
      throw new Error('Failed to retrieve volunteer profile.');
    }
    const shifts = (profile.shifts || []).map((s: any) => ({
      ...s,
      id: s._id || s.id,
    }));
    const certificates = (profile.certificates || []).map((c: any) => ({
      ...c,
      id: c._id || c.id,
    }));
    return {
      ...profile,
      shifts,
      certificates,
    };
  },

  /**
   * Volunteer Only: Update skills & preferences
   */
  async updateMyVolunteerProfile(payload: {
    skills?: string[];
    availability?: string;
    primaryFocus?: string;
  }): Promise<any> {
    const res = await api.put<{ volunteer: any }>('/volunteers/me', payload);
    return (res as any)?.volunteer || (res as any)?.data?.volunteer;
  },

  /**
   * Volunteer Only: Fetch authenticated volunteer's shifts
   */
  async getMyShifts(): Promise<VolunteerShift[]> {
    const res = await api.get<{ shifts: VolunteerShift[] }>('/volunteers/me/shifts');
    const rawShifts = (res as any)?.shifts || (res as any)?.data?.shifts || [];
    return rawShifts.map((s: any) => ({
      ...s,
      id: s._id || s.id,
    }));
  },

  /**
   * Volunteer Only: Self-log completed or scheduled shift
   */
  async logVolunteerShift(payload: LogShiftInput): Promise<VolunteerShift> {
    const res = await api.post<{ shift: VolunteerShift }>('/volunteers/me/shifts', payload);
    const s: any = (res as any)?.shift || (res as any)?.data?.shift;
    return {
      ...s,
      id: s?._id || s?.id,
    };
  },

  /**
   * Volunteer Only: Fetch authenticated volunteer's certificates
   */
  async getMyCertificates(): Promise<VolunteerCertificate[]> {
    const res = await api.get<{ certificates: VolunteerCertificate[] }>('/volunteers/me/certificates');
    const rawCerts = (res as any)?.certificates || (res as any)?.data?.certificates || [];
    return rawCerts.map((c: any) => ({
      ...c,
      id: c._id || c.id,
    }));
  },

  /**
   * Volunteer Only: Register for event
   */
  async registerForEvent(eventId: string): Promise<any> {
    const res = await api.post(`/volunteers/events/${eventId}/register`);
    return (res as any)?.data || res;
  },

  // ============================================================================
  // ADMIN ONLY METHODS (authenticate -> authorize('ADMIN'))
  // ============================================================================

  /**
   * Admin: List all volunteers across the trust
   */
  async adminListVolunteers(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<{ volunteers: any[]; pagination: any }>(`/volunteers${queryString}`);
    return (res as any)?.volunteers !== undefined ? res : (res as any)?.data;
  },

  /**
   * Admin: List all volunteer shifts
   */
  async adminListShifts(params?: { page?: number; limit?: number }): Promise<VolunteerShift[]> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<{ shifts: VolunteerShift[]; pagination: any }>(`/volunteers/admin/shifts${queryString}`);
    const rawShifts = (res as any)?.shifts || (res as any)?.data?.shifts || [];
    return rawShifts.map((s: any) => ({
      ...s,
      id: s._id || s.id,
    }));
  },

  /**
   * Admin: Verify volunteer shift
   */
  async adminVerifyShift(shiftId: string): Promise<VolunteerShift> {
    const res = await api.patch<{ shift: VolunteerShift }>(`/volunteers/admin/shifts/${shiftId}/verify`);
    const s: any = (res as any)?.shift || (res as any)?.data?.shift;
    return {
      ...s,
      id: s?._id || s?.id,
    };
  },

  /**
   * Admin: List all volunteer applications
   */
  async adminListApplications(params?: { page?: number; limit?: number; status?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.status) query.append('status', params.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<{ applications: any[]; pagination: any }>(`/volunteers/admin/applications${queryString}`);
    return (res as any)?.applications !== undefined ? res : (res as any)?.data;
  },

  /**
   * Admin: Approve or reject volunteer application
   */
  async adminReviewApplication(applicationId: string, status: 'APPROVED' | 'REJECTED') {
    const res = await api.patch<{ application: any }>(`/volunteers/admin/applications/${applicationId}`, {
      status,
    });
    return (res as any)?.application || (res as any)?.data?.application;
  },

  /**
   * Admin: Create volunteer role
   */
  async adminCreateRole(payload: Partial<VolunteerRole>): Promise<VolunteerRole> {
    const res = await api.post<{ role: VolunteerRole }>('/volunteers/admin/roles', payload);
    const r: any = (res as any)?.role || (res as any)?.data?.role;
    return {
      ...r,
      id: r?._id || r?.id,
    };
  },

  /**
   * Admin: Update volunteer role
   */
  async adminUpdateRole(roleId: string, payload: Partial<VolunteerRole>): Promise<VolunteerRole> {
    const res = await api.put<{ role: VolunteerRole }>(`/volunteers/admin/roles/${roleId}`, payload);
    const r: any = (res as any)?.role || (res as any)?.data?.role;
    return {
      ...r,
      id: r?._id || r?.id,
    };
  },

  /**
   * Admin: Delete volunteer role
   */
  async adminDeleteRole(roleId: string): Promise<void> {
    await api.delete(`/volunteers/admin/roles/${roleId}`);
  },

  /**
   * Admin: Issue digital certificate
   */
  async adminIssueCertificate(payload: {
    userId: string;
    volunteerName: string;
    serviceTitle: string;
    totalHours: number;
    signatoryTitle?: string;
    signatoryName?: string;
  }): Promise<VolunteerCertificate> {
    const res = await api.post<{ certificate: VolunteerCertificate }>('/volunteers/admin/certificates', payload);
    const c: any = (res as any)?.certificate || (res as any)?.data?.certificate;
    return {
      ...c,
      id: c?._id || c?.id,
    };
  },
};
