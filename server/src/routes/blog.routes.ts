import { Router } from 'express';
import { BlogController } from '../controllers/blog.controller';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  blogQuerySchema,
  createBlogSchema,
  updateBlogSchema,
} from '../validators/blog.validator';

const router = Router();

// Public: List published stories
router.get('/', validateQuery(blogQuerySchema), BlogController.getPosts);

// Admin: List all stories including drafts/unpublished
router.get(
  '/admin/all',
  authenticate,
  authorize('ADMIN'),
  validateQuery(blogQuerySchema),
  BlogController.getAdminPosts
);

// Public / Admin Preview: Retrieve single story by slug or ID
router.get('/:slug', optionalAuthenticate, BlogController.getPostBySlug);

// Admin: Create new blog post
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateBody(createBlogSchema),
  BlogController.createPost
);

// Admin: Update an existing blog post
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateBlogSchema),
  BlogController.updatePost
);

// Admin: Delete a blog post
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  BlogController.deletePost
);

export default router;
