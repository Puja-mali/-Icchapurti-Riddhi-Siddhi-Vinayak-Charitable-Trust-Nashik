import { api } from './api';
import { ImpactPassportRecord } from '../types';

export interface PassportsResponse {
  passports: ImpactPassportRecord[];
}

export interface PassportResponse {
  passport: ImpactPassportRecord;
}

export interface AdminPassportsResponse {
  passports: ImpactPassportRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PassportService {
  /**
   * Fetch authenticated donor's personal verified Impact Passports
   */
  public static async getMyPassports(): Promise<ImpactPassportRecord[]> {
    const res = await api.get<PassportsResponse>('/passport/my');
    return res.passports || [];
  }

  /**
   * Fetch a single Impact Passport by ID or Passport Number (enforces IDOR ownership on backend)
   */
  public static async getPassportById(id: string): Promise<ImpactPassportRecord> {
    const res = await api.get<PassportResponse>(`/passport/${id}`);
    return res.passport;
  }

  /**
   * Admin-only fetch of all verified Impact Passports across the trust
   */
  public static async getAllPassports(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<AdminPassportsResponse> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    const queryString = query.toString();
    return api.get<AdminPassportsResponse>(`/passport/admin/all${queryString ? `?${queryString}` : ''}`);
  }
}
