import mongoose from 'mongoose';
import { Donation } from '../models/Donation';
import { Cause } from '../models/Cause';
import { Event } from '../models/Event';
import { Volunteer } from '../models/Volunteer';
import { VolunteerApplication } from '../models/VolunteerApplication';
import { HelpRequest } from '../models/HelpRequest';
import { BlogPost } from '../models/BlogPost';
import { TransparencyReport } from '../models/TransparencyReport';
import { AppError } from '../utils/apiResponse';

export interface AdminActivityItem {
  id: string;
  type: 'DONATION' | 'HELP_REQUEST' | 'EVENT' | 'BLOG' | 'VOLUNTEER';
  title: string;
  description: string;
  timestamp: Date;
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

  // Lightweight real activity records (zero beneficiary personal info exposed)
  recentActivity: AdminActivityItem[];
}

export class AdminService {
  /**
   * Helper to verify database connectivity
   */
  private static checkDatabaseConnection(): void {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database service is currently unavailable. Please try again later.', 503);
    }
  }

  /**
   * Retrieve aggregated administrative dashboard summary metrics.
   * All figures are computed directly from real MongoDB collections.
   * Returns zeros for empty collections, never demo/mock figures.
   */
  public static async getDashboardSummary(): Promise<AdminDashboardSummary> {
    this.checkDatabaseConnection();

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [
      donationStats,
      currentMonthDonationStats,
      totalDonationsCount,
      totalCampaigns,
      activeCampaigns,
      totalEvents,
      upcomingEvents,
      totalVolunteers,
      pendingVolunteerApplications,
      totalHelpRequests,
      helpRequestStats,
      publishedNews,
      totalBlogPosts,
      galleryAgg,
      transparencyReports,
      totalTransparencyReports,
      recentDonations,
      recentHelpRequests,
      recentEvents,
      recentBlogs,
    ] = await Promise.all([
      // 1. All-time donation breakdown by payment status
      Donation.aggregate([
        {
          $group: {
            _id: '$status',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // 2. Verified donations for current calendar month
      Donation.aggregate([
        {
          $match: {
            status: 'SUCCESS',
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // 3. Total count of donation records
      Donation.countDocuments(),

      // 4. Cause / Campaign counts
      Cause.countDocuments(),
      Cause.countDocuments({ status: 'ACTIVE' }),

      // 5. Event counts
      Event.countDocuments(),
      Event.countDocuments({ status: 'UPCOMING' }),

      // 6. Volunteer count and pending applications
      Volunteer.countDocuments(),
      VolunteerApplication.countDocuments({ status: 'PENDING' }),

      // 7. Help request counts and status breakdown
      HelpRequest.countDocuments(),
      HelpRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),

      // 8. Blog / News counts
      BlogPost.countDocuments({ isPublished: true }),
      BlogPost.countDocuments(),

      // 9. Gallery items (stored within event galleryUrls array)
      Event.aggregate([
        { $unwind: '$galleryUrls' },
        { $count: 'total' },
      ]),

      // 10. Transparency report counts
      TransparencyReport.countDocuments({ isPublished: true }),
      TransparencyReport.countDocuments(),

      // 11. Recent records for activity feed (strictly avoiding sensitive beneficiary data)
      Donation.find({ status: 'SUCCESS' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id amount purpose createdAt')
        .lean(),

      HelpRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id requestType urgency status createdAt')
        .lean(),

      Event.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id title location status createdAt')
        .lean(),

      BlogPost.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('_id title isPublished createdAt')
        .lean(),
    ]);

    // Parse verified donation amounts
    const successStat = donationStats.find((s) => s._id === 'SUCCESS');
    const totalDonationAmount = successStat ? successStat.totalAmount : 0;
    const totalVerifiedDonations = successStat ? successStat.count : 0;

    const currentMonthSuccess = currentMonthDonationStats[0];
    const currentMonthDonationAmount = currentMonthSuccess ? currentMonthSuccess.totalAmount : 0;
    const currentMonthDonationsCount = currentMonthSuccess ? currentMonthSuccess.count : 0;

    // Parse help request statuses
    const getHelpStatusCount = (st: string) =>
      helpRequestStats.find((s) => s._id === st)?.count || 0;

    const pendingHelpRequests = getHelpStatusCount('PENDING');

    const helpRequestsByStatus = {
      pending: pendingHelpRequests,
      underReview: getHelpStatusCount('UNDER_REVIEW'),
      approved: getHelpStatusCount('APPROVED'),
      rejected: getHelpStatusCount('REJECTED'),
      inProgress: getHelpStatusCount('IN_PROGRESS'),
      resolved: getHelpStatusCount('RESOLVED'),
      closed: getHelpStatusCount('CLOSED'),
    };

    // Parse gallery count
    const galleryItems = galleryAgg.length > 0 ? galleryAgg[0].total : 0;

    // Assemble lightweight real activity feed without sensitive beneficiary data
    const activities: AdminActivityItem[] = [
      ...recentDonations.map((d: any) => ({
        id: d._id.toString(),
        type: 'DONATION' as const,
        title: `Donation of ₹${Number(d.amount).toLocaleString('en-IN')} verified`,
        description: d.purpose || 'General Trust Corpus',
        timestamp: d.createdAt,
      })),
      ...recentHelpRequests.map((h: any) => ({
        id: h._id.toString(),
        type: 'HELP_REQUEST' as const,
        title: `Aid request: ${h.requestType}`,
        description: `Urgency: ${h.urgency} • Status: ${h.status}`,
        timestamp: h.createdAt,
      })),
      ...recentEvents.map((e: any) => ({
        id: e._id.toString(),
        type: 'EVENT' as const,
        title: `Event: ${e.title}`,
        description: `Location: ${e.location} • Status: ${e.status}`,
        timestamp: e.createdAt,
      })),
      ...recentBlogs.map((b: any) => ({
        id: b._id.toString(),
        type: 'BLOG' as const,
        title: `Article: ${b.title}`,
        description: b.isPublished ? 'Published' : 'Draft',
        timestamp: b.createdAt,
      })),
    ];

    activities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const recentActivity = activities.slice(0, 10);

    return {
      totalDonations: totalDonationsCount,
      totalVerifiedDonations,
      totalDonationAmount,
      currentMonthDonationAmount,
      currentMonthDonationsCount,
      totalCampaigns,
      activeCampaigns,
      totalEvents,
      upcomingEvents,
      totalVolunteers,
      pendingVolunteerApplications,
      totalHelpRequests,
      pendingHelpRequests,
      helpRequestsByStatus,
      publishedNews,
      totalBlogPosts,
      galleryItems,
      transparencyReports,
      totalTransparencyReports,
      recentActivity,
    };
  }
}
