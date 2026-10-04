import { api } from './api';
import { TransparencyReport, TransparencyReportType } from '../types';

export interface TransparencyListParams {
  reportType?: string;
  financialYear?: string;
  search?: string;
  isFeatured?: boolean;
  isKumbhRelated?: boolean;
  isPublished?: boolean | 'ALL';
  page?: number;
  limit?: number;
}

export interface TransparencyListResponse {
  reports: TransparencyReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTransparencyInput {
  title: string;
  description: string;
  reportType: TransparencyReportType | string;
  financialYear: string;
  periodStart?: string;
  periodEnd?: string;
  fileUrl?: string;
  coverImage?: string;
  fileSize?: string;
  auditRating?: string;
  auditorFirm?: string;
  statutoryType?: string;
  totalDisbursal?: string;
  publishedAt?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  isKumbhRelated?: boolean;
}

export interface UpdateTransparencyInput extends Partial<CreateTransparencyInput> {}

/**
 * Normalizes backend MongoDB document into client TransparencyReport
 */
export const normalizeTransparencyReport = (raw: any): TransparencyReport => {
  if (!raw) {
    throw new Error('Invalid transparency report payload');
  }

  const id = raw.id || (raw._id ? (typeof raw._id === 'object' ? raw._id.toString() : String(raw._id)) : '');
  
  let formattedFilingDate = raw.filingDate;
  if (!formattedFilingDate && (raw.publishedAt || raw.createdAt)) {
    const d = new Date(raw.publishedAt || raw.createdAt);
    if (!isNaN(d.getTime())) {
      formattedFilingDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  return {
    id,
    title: raw.title || 'Untitled Report',
    description: raw.description || '',
    reportType: raw.reportType || 'Annual Report',
    financialYear: raw.financialYear || '',
    filingDate: formattedFilingDate || '',
    periodStart: raw.periodStart,
    periodEnd: raw.periodEnd,
    fileUrl: raw.fileUrl || '',
    coverImage: raw.coverImage || '',
    fileSize: raw.fileSize || '',
    auditRating: raw.auditRating || '',
    auditorFirm: raw.auditorFirm || '',
    statutoryType: raw.statutoryType || '',
    totalDisbursal: raw.totalDisbursal || '',
    publishedAt: raw.publishedAt,
    isPublished: raw.isPublished !== undefined ? Boolean(raw.isPublished) : true,
    isFeatured: Boolean(raw.isFeatured),
    isKumbhRelated: Boolean(raw.isKumbhRelated),
    createdBy: raw.createdBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const transparencyService = {
  /**
   * Public: Retrieve published reports
   */
  async getReports(params: TransparencyListParams = {}): Promise<TransparencyListResponse> {
    const queryParts: string[] = [];

    if (params.reportType && params.reportType !== 'All') {
      queryParts.push(`reportType=${encodeURIComponent(params.reportType)}`);
    }
    if (params.financialYear && params.financialYear !== 'All') {
      queryParts.push(`financialYear=${encodeURIComponent(params.financialYear)}`);
    }
    if (params.search) {
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    }
    if (params.isFeatured !== undefined) {
      queryParts.push(`isFeatured=${params.isFeatured}`);
    }
    if (params.isKumbhRelated !== undefined) {
      queryParts.push(`isKumbhRelated=${params.isKumbhRelated}`);
    }
    if (params.page) {
      queryParts.push(`page=${params.page}`);
    }
    if (params.limit) {
      queryParts.push(`limit=${params.limit}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await api.get<{ reports: any[]; pagination: any }>(`/transparency${queryString}`);

    return {
      reports: (response?.reports || []).map(normalizeTransparencyReport),
      pagination: response?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  /**
   * Public / Admin Preview: Retrieve single report by ID
   */
  async getReportById(id: string): Promise<TransparencyReport> {
    const response = await api.get<{ report: any }>(`/transparency/${encodeURIComponent(id)}`);
    if (!response?.report) {
      throw new Error(`Report '${id}' not found.`);
    }
    return normalizeTransparencyReport(response.report);
  },

  /**
   * Admin: List all reports including drafts and unpublished
   */
  async getAdminReports(params: TransparencyListParams = {}): Promise<TransparencyListResponse> {
    const queryParts: string[] = [];

    if (params.reportType && params.reportType !== 'All') {
      queryParts.push(`reportType=${encodeURIComponent(params.reportType)}`);
    }
    if (params.financialYear && params.financialYear !== 'All') {
      queryParts.push(`financialYear=${encodeURIComponent(params.financialYear)}`);
    }
    if (params.search) {
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    }
    if (params.isPublished !== undefined) {
      queryParts.push(`isPublished=${params.isPublished}`);
    }
    if (params.isFeatured !== undefined) {
      queryParts.push(`isFeatured=${params.isFeatured}`);
    }
    if (params.isKumbhRelated !== undefined) {
      queryParts.push(`isKumbhRelated=${params.isKumbhRelated}`);
    }
    if (params.page) {
      queryParts.push(`page=${params.page}`);
    }
    if (params.limit) {
      queryParts.push(`limit=${params.limit}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await api.get<{ reports: any[]; pagination: any }>(`/transparency/admin/all${queryString}`);

    return {
      reports: (response?.reports || []).map(normalizeTransparencyReport),
      pagination: response?.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 },
    };
  },

  /**
   * Admin: Create a new transparency report
   */
  async createReport(payload: CreateTransparencyInput): Promise<TransparencyReport> {
    const response = await api.post<{ report: any }>('/transparency', payload);
    return normalizeTransparencyReport(response.report);
  },

  /**
   * Admin: Update an existing report
   */
  async updateReport(id: string, payload: UpdateTransparencyInput): Promise<TransparencyReport> {
    const response = await api.patch<{ report: any }>(`/transparency/${encodeURIComponent(id)}`, payload);
    return normalizeTransparencyReport(response.report);
  },

  /**
   * Admin: Delete a report
   */
  async deleteReport(id: string): Promise<void> {
    await api.delete(`/transparency/${encodeURIComponent(id)}`);
  },
};
