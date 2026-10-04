import { api } from './api';
import {
  Cause,
  EventItem,
  BlogPost,
  TransparencyReport,
  ImpactPassportRecord,
  VolunteerRole,
  GalleryItem,
} from '../types';

export interface PublicHomeStats {
  activeCausesCount: number;
  totalCausesCount: number;
  upcomingEventsCount: number;
  publishedBlogCount: number;
  galleryItemsCount: number;
  approvedVolunteersCount: number;
  successfulDonationsCount: number;
  totalDonationsRaised: number;
  publishedAuditsCount: number;
}

export interface GalleryPreviewItem {
  url: string;
  title: string;
  location?: string;
  category?: string;
  eventSlug: string;
}

export interface PublicHomeData {
  stats: PublicHomeStats;
  featuredCauses: Cause[];
  upcomingEvents: EventItem[];
  latestNews: BlogPost[];
  recentAudits: TransparencyReport[];
  galleryPreview: GalleryPreviewItem[];
  samplePassport: ImpactPassportRecord | null;
}

export interface PublicKumbhData {
  featureEnabled: boolean;
  campaigns: Cause[];
  events: EventItem[];
  volunteerOpportunities: VolunteerRole[];
  announcements: BlogPost[];
  gallery: GalleryItem[];
}

export interface PublicSiteSettings {
  siteName: string;
  kumbhMode: boolean;
  defaultLanguage: string;
  supportedLanguages: string[];
}

export const publicService = {
  /**
   * Fetches real aggregated public data for the homepage:
   * Real stats, active causes, upcoming events, latest blogs, verified audits, and sample passport.
   */
  async getHomeData(): Promise<PublicHomeData> {
    return api.get<PublicHomeData>('/public/home');
  },

  /**
   * Fetches real aggregated public data for the Simhastha Kumbh 2027 module:
   * featureEnabled, campaigns, events, volunteer roles, announcements, and gallery proofs.
   */
  async getKumbhData(): Promise<PublicKumbhData> {
    return api.get<PublicKumbhData>('/public/kumbh');
  },

  /**
   * Fetches public site configuration including live Kumbh Mode feature flag status.
   */
  async getSettings(): Promise<PublicSiteSettings> {
    return api.get<PublicSiteSettings>('/public/settings');
  },
};

