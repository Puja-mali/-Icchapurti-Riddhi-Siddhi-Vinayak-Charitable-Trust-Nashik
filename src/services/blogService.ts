import { api } from './api';
import { BlogPost } from '../types';

export interface BlogListParams {
  category?: string;
  tag?: string;
  search?: string;
  isFeatured?: boolean;
  isKumbhRelated?: boolean;
  isPublished?: boolean | 'ALL';
  page?: number;
  limit?: number;
}

export interface BlogListResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBlogPostInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  author?: string;
  tags?: string[];
  isPublished?: boolean;
  publishedAt?: string;
  isFeatured?: boolean;
  isKumbhRelated?: boolean;
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {}

/**
 * Format date into friendly display string
 */
export const formatBlogDate = (dateVal?: string | Date): string => {
  if (!dateVal) return 'Recently Published';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Recently Published';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Normalizes backend MongoDB document into client BlogPost
 */
export const normalizeBlogPost = (raw: any): BlogPost => {
  if (!raw) {
    throw new Error('Invalid blog post payload');
  }

  const id = raw.id || (raw._id ? (typeof raw._id === 'object' ? raw._id.toString() : String(raw._id)) : '');
  const coverImage = raw.coverImage || raw.imageUrl || '';
  const dateStr = raw.publishedAt || raw.createdAt || raw.date;
  const formattedDate = formatBlogDate(dateStr);

  let calculatedReadTime = raw.readTime;
  if (!calculatedReadTime) {
    if (typeof raw.content === 'string') {
      const words = raw.content.trim().split(/\s+/).length;
      calculatedReadTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
    } else if (Array.isArray(raw.content)) {
      const words = raw.content.join(' ').trim().split(/\s+/).length;
      calculatedReadTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
    } else {
      calculatedReadTime = '3 min read';
    }
  }

  return {
    id,
    _id: id,
    title: raw.title || 'Untitled Post',
    slug: raw.slug || id,
    category: raw.category || 'General',
    author: raw.author || 'Siddhivinayak Trust',
    authorRole: raw.authorRole || 'Editorial Board',
    date: formattedDate,
    publishedDate: formattedDate,
    publishedAt: raw.publishedAt,
    readTime: calculatedReadTime,
    excerpt: raw.excerpt || '',
    content: raw.content || '',
    coverImage,
    imageUrl: coverImage,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    isPublished: raw.isPublished !== undefined ? Boolean(raw.isPublished) : true,
    isFeatured: Boolean(raw.isFeatured),
    isKumbhRelated: Boolean(raw.isKumbhRelated),
    createdBy: raw.createdBy,
    updatedBy: raw.updatedBy,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

export const blogService = {
  /**
   * Public: Retrieve published blog posts
   */
  async getPosts(params: BlogListParams = {}): Promise<BlogListResponse> {
    const queryParts: string[] = [];

    if (params.category && params.category !== 'All') {
      queryParts.push(`category=${encodeURIComponent(params.category)}`);
    }
    if (params.tag) {
      queryParts.push(`tag=${encodeURIComponent(params.tag)}`);
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
    const response = await api.get<{ posts: any[]; pagination: any }>(`/blog${queryString}`);

    return {
      posts: (response?.posts || []).map(normalizeBlogPost),
      pagination: response?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  /**
   * Public / Admin Preview: Retrieve single post by slug or ID
   */
  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await api.get<{ post: any }>(`/blog/${encodeURIComponent(slug)}`);
    if (!response?.post) {
      throw new Error(`Story '${slug}' not found.`);
    }
    return normalizeBlogPost(response.post);
  },

  /**
   * Admin: List all posts including drafts and unpublished
   */
  async getAdminPosts(params: BlogListParams = {}): Promise<BlogListResponse> {
    const queryParts: string[] = [];

    if (params.category && params.category !== 'All') {
      queryParts.push(`category=${encodeURIComponent(params.category)}`);
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
    const response = await api.get<{ posts: any[]; pagination: any }>(`/blog/admin/all${queryString}`);

    return {
      posts: (response?.posts || []).map(normalizeBlogPost),
      pagination: response?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  },

  /**
   * Admin: Create a new blog post
   */
  async createPost(payload: CreateBlogPostInput): Promise<BlogPost> {
    const response = await api.post<{ post: any }>('/blog', {
      title: payload.title,
      slug: payload.slug || undefined,
      excerpt: payload.excerpt,
      content: payload.content,
      coverImage: payload.coverImage,
      category: payload.category,
      author: payload.author || 'Siddhivinayak Trust',
      tags: payload.tags || [],
      isPublished: payload.isPublished ?? true,
      publishedAt: payload.publishedAt || undefined,
      isFeatured: !!payload.isFeatured,
      isKumbhRelated: !!payload.isKumbhRelated,
    });

    return normalizeBlogPost(response.post);
  },

  /**
   * Admin: Update an existing blog post
   */
  async updatePost(id: string, payload: UpdateBlogPostInput): Promise<BlogPost> {
    const response = await api.patch<{ post: any }>(`/blog/${encodeURIComponent(id)}`, payload);
    return normalizeBlogPost(response.post);
  },

  /**
   * Admin: Delete a blog post
   */
  async deletePost(id: string): Promise<void> {
    await api.delete(`/blog/${encodeURIComponent(id)}`);
  },
};
