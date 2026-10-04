import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services/blog.service';
import { sendSuccess } from '../utils/apiResponse';
import { BlogQueryParams } from '../validators/blog.validator';

export class BlogController {
  /**
   * Public: List all published posts
   */
  public static async getPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as BlogQueryParams;
      const result = await BlogService.getPublishedPosts(query);
      sendSuccess(res, result, 'Blog stories retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public / Admin Preview: Retrieve single post by slug or ID
   */
  public static async getPostBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const isAdmin = req.user?.role === 'ADMIN';
      const post = await BlogService.getPostBySlugOrId(slug, isAdmin);
      sendSuccess(res, { post }, 'Story retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: List all posts (including drafts and unpublished)
   */
  public static async getAdminPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as BlogQueryParams;
      const result = await BlogService.getAllPostsAdmin(query);
      sendSuccess(res, result, 'All blog records retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Create a new blog post
   */
  public static async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creatorUserId = req.user!._id;
      const post = await BlogService.createPost(req.body, creatorUserId);
      sendSuccess(res, { post }, 'Blog post created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Update an existing blog post
   */
  public static async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updaterUserId = req.user!._id;
      const post = await BlogService.updatePost(id, req.body, updaterUserId);
      sendSuccess(res, { post }, 'Blog post updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin: Delete a blog post
   */
  public static async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await BlogService.deletePost(id);
      sendSuccess(res, null, 'Blog post deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
