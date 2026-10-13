import mongoose from 'mongoose';
import { BlogPost, IBlogPost } from '../models/BlogPost';
import { AppError } from '../utils/apiResponse';
import { BlogQueryParams, CreateBlogInput, UpdateBlogInput } from '../validators/blog.validator';

export class BlogService {
  /**
   * Helper to generate URL-safe slug from title
   */
  public static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Helper to ensure unique slug in database
   */
  public static async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug || 'story';
    let counter = 1;

    while (true) {
      const query: Record<string, any> = { slug };
      if (excludeId) {
        query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
      }

      const existing = await BlogPost.findOne(query).select('_id').lean();
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  /**
   * Retrieve publicly available, published blog posts with filtering and pagination
   */
  public static async getPublishedPosts(query: BlogQueryParams): Promise<{
    posts: IBlogPost[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const skip = (page - 1) * limit;

    // Fast-exit if database is disconnected to avoid buffering hang
    if (mongoose.connection.readyState !== 1) {
      return {
        posts: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const filter: Record<string, any> = { isPublished: true };

    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }

    if (query.tag) {
      filter.tags = query.tag;
    }

    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured === 'true';
    }

    if (query.isKumbhRelated !== undefined) {
      filter.isKumbhRelated = query.isKumbhRelated === 'true';
    }

    if (query.search && query.search.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
        { author: searchRegex },
      ];
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name')
        .exec(),
      BlogPost.countDocuments(filter),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve a single blog post by slug or ID
   * If public user, strictly requires isPublished: true
   */
  public static async getPostBySlugOrId(idOrSlug: string, isAdmin: boolean = false): Promise<IBlogPost> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError(`Story '${idOrSlug}' not found. Database connection unavailable.`, 404);
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    let post: IBlogPost | null = null;
    const populateFields = isAdmin ? 'name email' : 'name';

    if (isObjectId) {
      post = await BlogPost.findById(idOrSlug).populate('createdBy updatedBy', populateFields).exec();
    }

    if (!post) {
      post = await BlogPost.findOne({ slug: idOrSlug.toLowerCase() })
        .populate('createdBy updatedBy', populateFields)
        .exec();
    }

    if (!post) {
      throw new AppError(`Story '${idOrSlug}' not found in news archive.`, 404);
    }

    if (!isAdmin && !post.isPublished) {
      throw new AppError(`Story '${idOrSlug}' is not published.`, 404);
    }

    return post;
  }

  /**
   * Admin: List all posts (including drafts and unpublished)
   */
  public static async getAllPostsAdmin(query: BlogQueryParams): Promise<{
    posts: IBlogPost[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
    const skip = (page - 1) * limit;

    if (mongoose.connection.readyState !== 1) {
      return {
        posts: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    const filter: Record<string, any> = {};

    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }

    if (query.isPublished && query.isPublished !== 'ALL') {
      filter.isPublished = query.isPublished === 'true';
    }

    if (query.isFeatured !== undefined) {
      filter.isFeatured = query.isFeatured === 'true';
    }

    if (query.isKumbhRelated !== undefined) {
      filter.isKumbhRelated = query.isKumbhRelated === 'true';
    }

    if (query.search && query.search.trim()) {
      const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
        { author: searchRegex },
      ];
    }

    const [posts, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy updatedBy', 'name email')
        .exec(),
      BlogPost.countDocuments(filter),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Create a new blog post
   */
  public static async createPost(input: CreateBlogInput, creatorUserId: string): Promise<IBlogPost> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable. Please configure MONGODB_URI.', 503);
    }

    const rawSlug = input.slug || this.generateSlug(input.title);
    const uniqueSlug = await this.ensureUniqueSlug(rawSlug);

    const post = new BlogPost({
      ...input,
      slug: uniqueSlug,
      author: input.author || 'Siddhivinayak Trust',
      tags: input.tags || [],
      isPublished: input.isPublished ?? true,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      isFeatured: !!input.isFeatured,
      isKumbhRelated: !!input.isKumbhRelated,
      createdBy: new mongoose.Types.ObjectId(creatorUserId),
      updatedBy: new mongoose.Types.ObjectId(creatorUserId),
    });

    await post.save();
    return post;
  }

  /**
   * Admin: Update an existing blog post
   */
  public static async updatePost(
    id: string,
    input: UpdateBlogInput,
    updaterUserId: string
  ): Promise<IBlogPost> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable. Please configure MONGODB_URI.', 503);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid blog post identifier.', 400);
    }

    const post = await BlogPost.findById(id);
    if (!post) {
      throw new AppError(`Blog post with ID '${id}' not found.`, 404);
    }

    if (input.slug && input.slug !== post.slug) {
      post.slug = await this.ensureUniqueSlug(input.slug, id);
    } else if (input.title && !input.slug && input.title !== post.title && !post.slug) {
      post.slug = await this.ensureUniqueSlug(this.generateSlug(input.title), id);
    }

    if (input.title !== undefined) post.title = input.title;
    if (input.excerpt !== undefined) post.excerpt = input.excerpt;
    if (input.content !== undefined) post.content = input.content;
    if (input.coverImage !== undefined) post.coverImage = input.coverImage;
    if (input.category !== undefined) post.category = input.category;
    if (input.author !== undefined) post.author = input.author;
    if (input.tags !== undefined) post.tags = input.tags;
    if (input.isPublished !== undefined) post.isPublished = input.isPublished;
    if (input.publishedAt !== undefined) post.publishedAt = new Date(input.publishedAt);
    if (input.isFeatured !== undefined) post.isFeatured = input.isFeatured;
    if (input.isKumbhRelated !== undefined) post.isKumbhRelated = input.isKumbhRelated;
    if (input.translations !== undefined) post.translations = input.translations;

    post.updatedBy = new mongoose.Types.ObjectId(updaterUserId);

    await post.save();
    return post;
  }

  /**
   * Admin: Delete a blog post
   */
  public static async deletePost(id: string): Promise<void> {
    if (mongoose.connection.readyState !== 1) {
      throw new AppError('Database connection unavailable. Please configure MONGODB_URI.', 503);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid blog post identifier.', 400);
    }

    const deleted = await BlogPost.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError(`Blog post with ID '${id}' not found.`, 404);
    }
  }
}
