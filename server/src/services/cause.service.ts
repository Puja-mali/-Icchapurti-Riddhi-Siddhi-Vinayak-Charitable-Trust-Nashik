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

export const DEFAULT_CAUSES: any[] = [];

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

    // In standalone/offline mode, return clean empty result
    if (mongoose.connection.readyState !== 1) {
      return {
        causes: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
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
      throw new AppError(`Campaign '${idOrSlug}' not found.`, 404);
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
