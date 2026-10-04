import mongoose from 'mongoose';
import { Cause, ICause } from '../models/Cause';
import { CreateCauseInput, UpdateCauseInput, ListCausesQuery } from '../validators/cause.validator';
import { AppError } from '../utils/apiResponse';

export interface PaginatedCausesResult {
  causes: ICause[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const DEFAULT_CAUSES: any[] = [
  {
    _id: 'cause-notebooks',
    id: 'cause-notebooks',
    title: 'Notebooks & School Stationery Distribution Drive',
    slug: 'notebooks-stationery-distribution',
    shortDescription: 'Providing notebooks, pens, and essential learning stationery for underprivileged school children in Nashik and surrounding rural areas.',
    description: 'Direct distribution of quality notebook bundles and stationery sets to students in government and community schools. Ensures students have essential writing materials for uninterrupted education.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik & Rural Maharashtra',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-dress',
    id: 'cause-dress',
    title: 'School Uniforms & Dress Distribution for Students',
    slug: 'school-dress-distribution',
    shortDescription: 'Supplying school uniforms and stitched dress sets to underprivileged and orphan children.',
    description: 'Providing durable and comfortable school uniforms to needy students, supporting their dignity, attendance, and enthusiasm for daily schooling.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik District',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-water-podium',
    id: 'cause-water-podium',
    title: 'School Infrastructure: Clean Water Purifier & Assembly Podium',
    slug: 'school-water-purifier-podium-support',
    shortDescription: 'Installing commercial RO water purifiers and stage assembly podiums in public schools.',
    description: 'Safe drinking water is essential for child health. This program provides reliable RO water purification filtration systems and stage podiums for school assembly grounds.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Schools',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-5-children',
    id: 'cause-5-children',
    title: 'Educational Support & Academic Care for 5 Children',
    slug: 'educational-support-5-children',
    shortDescription: 'Dedicated educational adoption covering school fees, books, and academic essentials for 5 orphan and needy children.',
    description: 'Providing comprehensive annual academic support for 5 orphan and destitute children. Covers school admission, textbooks, tuition assistance, and learning materials without inflating impact numbers.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Education',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik',
    urgent: true,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-clothing-sweater',
    id: 'cause-clothing-sweater',
    title: 'Free Clothing & Winter Sweater Distribution',
    slug: 'clothing-sweater-distribution',
    shortDescription: 'Distributing warm winter sweaters, blankets, and seasonal clothing to poor and destitute families.',
    description: 'Seasonal distribution of warm sweaters and clean clothes for disadvantaged children, daily-wage laborers, and roadside destitute persons across Nashik.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Emergency Relief',
    imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik & Surrounding Hamlets',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-diwali-faral',
    id: 'cause-diwali-faral',
    title: 'Diwali Faral & Wholesome Food Distribution',
    slug: 'diwali-faral-food-distribution',
    shortDescription: 'Sharing festive Diwali Faral sweets, snacks, and dry food grains with economically disadvantaged families.',
    description: 'Ensuring that every family in our community celebrates festive moments with dignity and joy through fresh, hygienic Diwali Faral packets and staple groceries.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Food & Nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-senior-citizens',
    id: 'cause-senior-citizens',
    title: 'Senior Citizens Welfare: Umbrellas & Walking Sticks',
    slug: 'senior-citizens-umbrellas-walking-sticks',
    shortDescription: 'Providing durable walking sticks, monsoon umbrellas, and support aids to elderly citizens through Jyeshtha Nagrik Sangh.',
    description: 'Elderly care initiative providing sturdy mobility walking sticks and monsoon umbrellas to senior citizens, alongside regular healthcare checkups and social engagement.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Emergency Relief',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Senior Centers',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-medical-camps',
    id: 'cause-medical-camps',
    title: 'Free Community Medical Diagnostic & Health Camps',
    slug: 'free-medical-health-camps',
    shortDescription: 'Periodic free health screening, vital checks, doctor consultations, and naturopathy advice.',
    description: 'Organizing accessible health checkup camps in underserved neighborhoods. Doctors perform general physical examinations, blood pressure checks, and provide health counseling.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Medical Support',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Community Centers',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
  {
    _id: 'cause-tree-plantation',
    id: 'cause-tree-plantation',
    title: 'Native Tree Plantation & Green Nashik Drive',
    slug: 'tree-plantation-green-nashik',
    shortDescription: 'Planting indigenous trees and saplings to restore green cover and promote environmental care.',
    description: 'Community-led tree plantation campaigns planting native banyan, peepal, neem, and fruit saplings across schools and public grounds with regular watering care.',
    targetAmount: 0,
    raisedAmount: 0,
    category: 'Environment',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    status: 'ACTIVE',
    location: 'Nashik Grounds & Schools',
    urgent: false,
    donorCount: 0,
    isKumbhRelated: false,
    allocationBreakdown: [],
    impactMilestones: [],
  },
];

export class CauseService {
  /**
   * Helper to generate a clean, URL-safe slug from a campaign title
   */
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Ensure slug is unique in the database
   */
  private static async ensureUniqueSlug(baseSlug: string, currentId?: string): Promise<string> {
    let slug = baseSlug || 'campaign';
    let counter = 1;

    while (true) {
      const existing = await Cause.findOne({ slug });
      if (!existing || (currentId && existing._id.toString() === currentId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Retrieve list of campaigns with filtering, search, and pagination
   */
  public static async listCauses(
    query: ListCausesQuery,
    isAdmin: boolean = false
  ): Promise<PaginatedCausesResult> {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const skip = (page - 1) * limit;

    // In standalone/offline mode, return filtered DEFAULT_CAUSES
    if (mongoose.connection.readyState !== 1) {
      let filtered = [...DEFAULT_CAUSES];
      if (query.category && query.category !== 'All') {
        filtered = filtered.filter((c) => c.category === query.category);
      }
      if (query.status && query.status !== 'ALL') {
        filtered = filtered.filter((c) => c.status === query.status);
      }
      if (query.urgent === 'true') {
        filtered = filtered.filter((c) => c.urgent);
      }
      if (query.search && query.search.trim()) {
        const s = query.search.trim().toLowerCase();
        filtered = filtered.filter((c) =>
          c.title.toLowerCase().includes(s) ||
          c.shortDescription.toLowerCase().includes(s) ||
          c.location.toLowerCase().includes(s)
        );
      }
      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);
      return {
        causes: paginated as unknown as ICause[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    const filter: Record<string, any> = {};

    // Category filter
    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }

    // Status filter
    if (query.status) {
      if (query.status === 'ALL') {
        if (!isAdmin) {
          filter.status = { $in: ['ACTIVE', 'COMPLETED'] };
        }
        // If admin, no status filter needed
      } else {
        filter.status = query.status;
      }
    } else {
      // Default behavior for public catalog: only show ACTIVE campaigns (or COMPLETED)
      if (!isAdmin) {
        filter.status = { $in: ['ACTIVE', 'COMPLETED'] };
      }
    }

    // Kumbh Seva related filter
    if (query.isKumbhRelated !== undefined) {
      filter.isKumbhRelated = query.isKumbhRelated === 'true';
    }

    // Urgent filter
    if (query.urgent !== undefined && query.urgent === 'true') {
      filter.urgent = true;
    }

    // Text search query
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { location: searchRegex },
      ];
    }

    const [causes, total] = await Promise.all([
      Cause.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ urgent: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Cause.countDocuments(filter),
    ]);

    return {
      causes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieve a single campaign by either MongoDB _id or URL slug
   * Non-admin callers cannot access DRAFT campaigns, and creator email/role is never exposed.
   */
  public static async getCauseByIdOrSlug(idOrSlug: string, isAdmin: boolean = false): Promise<ICause> {
    if (mongoose.connection.readyState !== 1) {
      const match = DEFAULT_CAUSES.find(
        (c) => c._id === idOrSlug || c.id === idOrSlug || c.slug === idOrSlug.toLowerCase()
      );
      if (!match) {
        throw new AppError(`Campaign '${idOrSlug}' not found.`, 404);
      }
      return match as unknown as ICause;
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    let cause: ICause | null = null;

    if (isObjectId) {
      cause = await Cause.findById(idOrSlug).populate('createdBy', 'name');
    }

    if (!cause) {
      cause = await Cause.findOne({ slug: idOrSlug.toLowerCase() }).populate('createdBy', 'name');
    }

    if (!cause) {
      throw new AppError(`Campaign '${idOrSlug}' not found.`, 404);
    }

    if (!isAdmin && cause.status === 'DRAFT') {
      throw new AppError(`Campaign '${idOrSlug}' not found.`, 404);
    }

    return cause;
  }

  /**
   * Create a new campaign (Admin operation)
   */
  public static async createCause(input: CreateCauseInput, creatorUserId: string): Promise<ICause> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable. Please configure MONGODB_URI.', 503);
    }

    const rawSlug = input.slug || this.generateSlug(input.title);
    const uniqueSlug = await this.ensureUniqueSlug(rawSlug);

    const cause = await Cause.create({
      ...input,
      slug: uniqueSlug,
      createdBy: new mongoose.Types.ObjectId(creatorUserId),
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });

    return cause;
  }

  /**
   * Update an existing campaign (Admin operation)
   */
  public static async updateCause(id: string, input: UpdateCauseInput): Promise<ICause> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable. Please configure MONGODB_URI.', 503);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid campaign identifier.', 400);
    }

    const existing = await Cause.findById(id);
    if (!existing) {
      throw new AppError('Campaign not found.', 404);
    }

    let updatedSlug = existing.slug;
    if (input.slug && input.slug !== existing.slug) {
      updatedSlug = await this.ensureUniqueSlug(input.slug, id);
    }

    const updatePayload: Record<string, any> = {
      ...input,
      slug: updatedSlug,
    };

    if (input.startDate) {
      updatePayload.startDate = new Date(input.startDate);
    }
    if (input.endDate) {
      updatePayload.endDate = new Date(input.endDate);
    }

    const updated = await Cause.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email role');

    if (!updated) {
      throw new AppError('Campaign not found during update.', 404);
    }

    return updated;
  }

  /**
   * Permanently delete a campaign (Admin operation)
   */
  public static async deleteCause(id: string): Promise<ICause> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid campaign identifier.', 400);
    }

    const deleted = await Cause.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError('Campaign not found.', 404);
    }

    return deleted;
  }
}
