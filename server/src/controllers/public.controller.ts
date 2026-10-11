import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Cause } from '../models/Cause';
import { Event } from '../models/Event';
import { BlogPost } from '../models/BlogPost';
import { Donation } from '../models/Donation';
import { Volunteer } from '../models/Volunteer';
import { VolunteerRole } from '../models/VolunteerRole';
import { TransparencyReport } from '../models/TransparencyReport';
import { SettingsService } from '../services/settings.service';
import { PassportService } from '../services/passport.service';
import { DEFAULT_CAUSES } from '../services/cause.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export class PublicController {
  /**
   * GET /api/public/home
   * Aggregated public data for the homepage from real MongoDB collections.
   */
  public static async getHomeData(req: Request, res: Response): Promise<Response> {
    try {
      if (mongoose.connection.readyState !== 1) {
        return sendSuccess(
          res,
          {
            stats: {
              activeCausesCount: 0,
              totalCausesCount: 0,
              upcomingEventsCount: 0,
              publishedBlogCount: 0,
              approvedVolunteersCount: 0,
              publishedAuditsCount: 0,
              galleryItemsCount: 0,
              successfulDonationsCount: 0,
              totalDonationsRaised: 0,
            },
            featuredCauses: [],
            upcomingEvents: [],
            latestNews: [],
            recentAudits: [],
            galleryPreview: [],
            samplePassport: null,
          },
          'Public home data retrieved successfully (clean state)'
        );
      }

      const [
        activeCausesCount,
        totalCausesCount,
        upcomingEventsCount,
        publishedBlogCount,
        approvedVolunteersCount,
        publishedAuditsCount,
        donationsAgg,
        rawFeaturedCauses,
        rawUpcomingEvents,
        rawLatestNews,
        rawRecentAudits,
        eventsWithGallery,
        sampleDonation,
      ] = await Promise.all([
        Cause.countDocuments({ status: 'ACTIVE' }),
        Cause.countDocuments(),
        Event.countDocuments({ status: { $in: ['UPCOMING', 'ONGOING'] } }),
        BlogPost.countDocuments({ isPublished: true }),
        Volunteer.countDocuments({ status: 'APPROVED' }),
        TransparencyReport.countDocuments({ isPublished: true }),
        Donation.aggregate([
          { $match: { status: 'SUCCESS' } },
          { $group: { _id: null, totalRaised: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Cause.find({ status: 'ACTIVE' })
          .sort({ urgent: -1, raisedAmount: -1, createdAt: -1 })
          .limit(3)
          .lean(),
        Event.find({ status: { $in: ['UPCOMING', 'ONGOING'] } })
          .sort({ startDate: 1 })
          .limit(3)
          .lean(),
        BlogPost.find({ isPublished: true })
          .sort({ isFeatured: -1, publishedAt: -1 })
          .limit(3)
          .lean(),
        TransparencyReport.find({ isPublished: true })
          .sort({ year: -1, period: -1 })
          .limit(3)
          .lean(),
        Event.find({
          status: { $ne: 'DRAFT' },
          $or: [
            { galleryUrls: { $exists: true, $not: { $size: 0 } } },
            { imageUrl: { $exists: true, $ne: '' } },
          ],
        })
          .select('title slug galleryUrls imageUrl location category')
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Donation.findOne({ status: 'SUCCESS' })
          .populate('causeId')
          .sort({ amount: -1 })
          .lean(),
      ]);

      const successfulDonationsCount = donationsAgg[0]?.count || 0;
      const totalDonationsRaised = donationsAgg[0]?.totalRaised || 0;

      const galleryPreview: Array<{
        url: string;
        title: string;
        location?: string;
        category?: string;
        eventSlug: string;
      }> = [];

      for (const ev of eventsWithGallery) {
        if (Array.isArray(ev.galleryUrls) && ev.galleryUrls.length > 0) {
          for (const url of ev.galleryUrls) {
            if (url && galleryPreview.length < 6) {
              galleryPreview.push({
                url,
                title: ev.title,
                location: ev.location,
                category: ev.category,
                eventSlug: ev.slug || (ev._id ? ev._id.toString() : ''),
              });
            }
          }
        } else if (ev.imageUrl && galleryPreview.length < 6) {
          galleryPreview.push({
            url: ev.imageUrl,
            title: ev.title,
            location: ev.location,
            category: ev.category,
            eventSlug: ev.slug || (ev._id ? ev._id.toString() : ''),
          });
        }
      }

      const samplePassport = sampleDonation
        ? PassportService.toPassportRecord(
            sampleDonation as any,
            (sampleDonation as any).causeId,
            { anonymize: true }
          )
        : null;

      const featuredCauses = rawFeaturedCauses.map((c: any) => ({
        id: c._id ? c._id.toString() : '',
        _id: c._id ? c._id.toString() : '',
        title: c.title,
        slug: c.slug,
        category: c.category || 'Other',
        tagline: c.shortDescription || '',
        shortDescription: c.shortDescription,
        description: c.description,
        targetAmount: c.targetAmount || 0,
        raisedAmount: c.raisedAmount || 0,
        donorCount: c.donorCount || 0,
        imageUrl: c.imageUrl,
        location: c.location || 'Maharashtra',
        status: c.status,
        urgent: Boolean(c.urgent),
        allocationBreakdown: c.allocationBreakdown || [],
      }));

      const upcomingEvents = rawUpcomingEvents.map((e: any) => ({
        id: e._id ? e._id.toString() : '',
        _id: e._id ? e._id.toString() : '',
        title: e.title,
        slug: e.slug,
        category: e.category || 'Other',
        shortDescription: e.shortDescription,
        description: e.description,
        location: e.location,
        date: e.startDate
          ? new Date(e.startDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '',
        time: e.startDate
          ? new Date(e.startDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        startDate: e.startDate ? new Date(e.startDate).toISOString() : '',
        endDate: e.endDate ? new Date(e.endDate).toISOString() : undefined,
        imageUrl: e.imageUrl,
        capacity: e.capacity || e.registrationLimit || 0,
        registrationLimit: e.registrationLimit || 0,
        registeredCount: e.registrationCount || 0,
        registrationCount: e.registrationCount || 0,
        status: e.status,
      }));

      const latestNews = rawLatestNews.map((b: any) => ({
        id: b._id ? b._id.toString() : '',
        _id: b._id ? b._id.toString() : '',
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content || b.excerpt,
        coverImage: b.coverImage,
        category: b.category || 'Dispatches',
        author: b.author || 'Siddhivinayak Trust',
        publishedAt: b.publishedAt
          ? new Date(b.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '',
        readTime: b.readTime || '3 min read',
        isFeatured: Boolean(b.isFeatured),
      }));

      const recentAudits = rawRecentAudits.map((a: any) => ({
        id: a._id ? a._id.toString() : '',
        _id: a._id ? a._id.toString() : '',
        title: a.title,
        year: a.year,
        period: a.period,
        type: a.type,
        auditor: a.auditor,
        fileUrl: a.fileUrl,
        summary: a.summary,
        totalDonations: a.totalDonations || 0,
        totalDisbursed: a.totalDisbursed || 0,
        programRatio: a.programRatio || 0,
      }));

      return sendSuccess(
        res,
        {
          stats: {
            activeCausesCount,
            totalCausesCount,
            upcomingEventsCount,
            publishedBlogCount,
            galleryItemsCount: galleryPreview.length,
            approvedVolunteersCount,
            successfulDonationsCount,
            totalDonationsRaised,
            publishedAuditsCount,
          },
          featuredCauses,
          upcomingEvents,
          latestNews,
          recentAudits,
          galleryPreview,
          samplePassport,
        },
        'Public home data retrieved successfully'
      );
    } catch (error: any) {
      console.error('Error fetching public home data:', error);
      return sendError(res, 'Failed to retrieve public home records.', 500);
    }
  }

  /**
   * GET /api/public/kumbh
   * Public-facing Kumbh Simhastha 2027 data:
   * - featureEnabled
   * - published Kumbh-related campaigns
   * - published Kumbh-related events
   * - public volunteer opportunities
   * - published Kumbh-related announcements/news
   * - published Kumbh-related gallery items
   *
   * Completely read-only and idempotent.
   * If DB is empty, returns real empty arrays.
   * If DB is disconnected, returns 503 error.
   * NEVER returns mock/fake records.
   */
  public static async getKumbhData(req: Request, res: Response): Promise<Response> {
    try {
      const publicSettings = await SettingsService.getPublicSettings();
      const featureEnabled = publicSettings.kumbhMode === true;

      if (!featureEnabled) {
        return sendSuccess(
          res,
          {
            featureEnabled: false,
            campaigns: [],
            events: [],
            volunteerOpportunities: [],
            announcements: [],
            gallery: [],
          },
          'Kumbh Seva module is currently disabled'
        );
      }

      if (mongoose.connection.readyState !== 1) {
        return sendError(res, 'Database connection is not ready.', 503);
      }

      const [rawCauses, rawEvents, rawRoles, rawBlogs, eventsWithGallery] = await Promise.all([
        // 1. Kumbh Campaigns
        Cause.find({ isKumbhRelated: true, status: 'ACTIVE' })
          .select(
            'title slug shortDescription description targetAmount raisedAmount category imageUrl status urgent donorCount location isKumbhRelated allocationBreakdown createdAt'
          )
          .sort({ urgent: -1, createdAt: -1 })
          .lean(),

        // 2. Kumbh Events
        Event.find({ isKumbhRelated: true, status: { $in: ['UPCOMING', 'ONGOING'] } })
          .select(
            'title slug shortDescription description location startDate endDate category imageUrl status isKumbhRelated registrationRequired registrationLimit registrationCount capacity'
          )
          .sort({ startDate: 1 })
          .lean(),

        // 3. Kumbh Volunteer Roles
        VolunteerRole.find({ isKumbhRelated: true, isActive: true })
          .select(
            'title department commitment location description requirements spotsAvailable isKumbhRelated'
          )
          .sort({ createdAt: -1 })
          .lean(),

        // 4. Kumbh Announcements / Field Updates
        BlogPost.find({ isKumbhRelated: true, isPublished: true })
          .select(
            'title slug excerpt content coverImage category author publishedAt readTime isFeatured isKumbhRelated'
          )
          .sort({ isFeatured: -1, publishedAt: -1 })
          .lean(),

        // 5. Events with gallery media for Kumbh
        Event.find({
          isKumbhRelated: true,
          status: { $ne: 'DRAFT' },
          $or: [
            { galleryUrls: { $exists: true, $not: { $size: 0 } } },
            { imageUrl: { $exists: true, $ne: '' } },
          ],
        })
          .select('title slug galleryUrls imageUrl location category startDate shortDescription')
          .sort({ createdAt: -1 })
          .lean(),
      ]);

      const campaigns = rawCauses.map((c: any) => ({
        id: c._id ? c._id.toString() : '',
        _id: c._id ? c._id.toString() : '',
        title: c.title,
        slug: c.slug,
        tagline: c.shortDescription || '',
        shortDescription: c.shortDescription,
        description: c.description,
        targetAmount: c.targetAmount || 0,
        raisedAmount: c.raisedAmount || 0,
        category: c.category || 'Kumbh Seva',
        imageUrl: c.imageUrl,
        status: c.status,
        donorCount: c.donorCount || 0,
        location: c.location || 'Nashik–Trimbakeshwar',
        urgent: Boolean(c.urgent),
        isKumbhRelated: true,
        allocationBreakdown: c.allocationBreakdown || [],
      }));

      const events = rawEvents.map((e: any) => ({
        id: e._id ? e._id.toString() : '',
        _id: e._id ? e._id.toString() : '',
        title: e.title,
        slug: e.slug,
        shortDescription: e.shortDescription,
        description: e.description,
        location: e.location,
        date: e.startDate
          ? new Date(e.startDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '',
        time: e.startDate
          ? new Date(e.startDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '',
        startDate: e.startDate ? new Date(e.startDate).toISOString() : '',
        endDate: e.endDate ? new Date(e.endDate).toISOString() : undefined,
        category: e.category || 'Kumbh Seva',
        imageUrl: e.imageUrl,
        status: e.status,
        isKumbhRelated: true,
        registrationRequired: Boolean(e.registrationRequired),
        registrationLimit: e.registrationLimit || 0,
        registrationCount: e.registrationCount || 0,
        registeredCount: e.registrationCount || 0,
        capacity: e.capacity || e.registrationLimit || 0,
      }));

      const volunteerOpportunities = rawRoles.map((r: any) => ({
        id: r._id ? r._id.toString() : '',
        _id: r._id ? r._id.toString() : '',
        title: r.title,
        department: r.department,
        commitment: r.commitment,
        location: r.location,
        description: r.description,
        requirements: r.requirements || [],
        spotsAvailable: r.spotsAvailable || 0,
        isKumbhRelated: true,
      }));

      const announcements = rawBlogs.map((b: any) => ({
        id: b._id ? b._id.toString() : '',
        _id: b._id ? b._id.toString() : '',
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content || b.excerpt,
        coverImage: b.coverImage,
        category: b.category || 'Kumbh Seva',
        author: b.author || 'Siddhivinayak Trust',
        publishedAt: b.publishedAt
          ? new Date(b.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '',
        readTime: b.readTime || '3 min read',
        isFeatured: Boolean(b.isFeatured),
        isKumbhRelated: true,
      }));

      const gallery: Array<{
        id: string;
        title: string;
        category: string;
        imageUrl: string;
        location: string;
        date: string;
        caption: string;
        isKumbhRelated: boolean;
      }> = [];

      for (const ev of eventsWithGallery) {
        if (Array.isArray(ev.galleryUrls) && ev.galleryUrls.length > 0) {
          ev.galleryUrls.forEach((url: string, idx: number) => {
            if (url) {
              gallery.push({
                id: `${ev._id}-gallery-${idx}`,
                title: ev.title,
                category: 'Kumbh Seva',
                imageUrl: url,
                location: ev.location || 'Nashik',
                date: ev.startDate
                  ? new Date(ev.startDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '',
                caption: ev.shortDescription || ev.title,
                isKumbhRelated: true,
              });
            }
          });
        } else if (ev.imageUrl) {
          gallery.push({
            id: `${ev._id}-main`,
            title: ev.title,
            category: 'Kumbh Seva',
            imageUrl: ev.imageUrl,
            location: ev.location || 'Nashik',
            date: ev.startDate
              ? new Date(ev.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : '',
            caption: ev.shortDescription || ev.title,
            isKumbhRelated: true,
          });
        }
      }

      return sendSuccess(
        res,
        {
          featureEnabled: true,
          campaigns,
          events,
          volunteerOpportunities,
          announcements,
          gallery,
        },
        'Public Kumbh Seva records retrieved successfully'
      );
    } catch (error: any) {
      console.error('Error fetching public Kumbh data:', error);
      return sendError(res, 'Failed to retrieve public Kumbh records from database.', 500);
    }
  }

  /**
   * GET /api/public/settings
   * Returns public-safe site settings (e.g., kumbhMode flag)
   */
  public static async getSettings(req: Request, res: Response): Promise<Response> {
    try {
      const settings = await SettingsService.getPublicSettings();
      return sendSuccess(res, settings, 'Public settings retrieved successfully');
    } catch (error: any) {
      console.error('Error fetching public settings:', error);
      return sendError(res, 'Failed to fetch public settings.', 500);
    }
  }
}
