import { api } from './api';

export interface AdminActivityItem {
  id: string;
  type: 'DONATION' | 'HELP_REQUEST' | 'EVENT' | 'BLOG' | 'VOLUNTEER';
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardSummary {
  // Donation metrics
  totalDonations: number;
  totalVerifiedDonations: number;
  totalDonationAmount: number;
  currentMonthDonationAmount: number;
  currentMonthDonationsCount: number;

  // Campaign / Cause metrics
  totalCampaigns: number;
  activeCampaigns: number;

  // Event metrics
  totalEvents: number;
  upcomingEvents: number;

  // Volunteer metrics
  totalVolunteers: number;
  pendingVolunteerApplications: number;

  // Help Request metrics
  totalHelpRequests: number;
  pendingHelpRequests: number;
  helpRequestsByStatus: {
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };

  // Content & Transparency metrics
  publishedNews: number;
  totalBlogPosts: number;
  galleryItems: number;
  transparencyReports: number;
  totalTransparencyReports: number;

  // Real activity records
  recentActivity: AdminActivityItem[];
}

export const adminService = {
  /**
   * Fetch authenticated admin dashboard summary statistics and activity from MongoDB.
   * Endpoint: GET /api/admin/dashboard/summary
   * Access: Protected (authenticate -> authorize('ADMIN'))
   */
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    const summary = await api.get<AdminDashboardSummary>('/admin/dashboard/summary');
    return summary;
  },

  /**
   * Fetch site settings including module configuration
   * Endpoint: GET /api/admin/settings
   * Access: Protected (authenticate -> authorize('ADMIN'))
   */
  async getSettings(): Promise<{ siteName: string; kumbhMode: boolean }> {
    return api.get<{ siteName: string; kumbhMode: boolean }>('/admin/settings');
  },

  /**
   * Toggle Kumbh Mode feature flag in MongoDB
   * Endpoint: PATCH /api/admin/settings/kumbh-mode
   * Access: Protected (authenticate -> authorize('ADMIN'))
   */
  async updateKumbhMode(enabled: boolean): Promise<{ siteName: string; kumbhMode: boolean }> {
    return api.patch<{ siteName: string; kumbhMode: boolean }>('/admin/settings/kumbh-mode', { enabled });
  },
};
