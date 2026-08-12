import { Router } from 'express';
import {
  getPublishedPosts,
  getPublishedPostBySlug,
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  getComments,
  addComment,
  deleteComment,
} from '../controllers/blogController.js';
import { authenticate, authorize, optionalAuth } from '../middlewares/auth.js';
import { uploadBlogCover } from '../middlewares/upload.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/published', getPublishedPosts);
router.get('/posts/:slug', optionalAuth, getPublishedPostBySlug);
router.get('/posts/:slug/comments', getComments);

router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/comments', authenticate, addComment);
router.delete('/comments/:id', authenticate, deleteComment);

router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getAllPosts);
router.get('/admin/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getPost);
router.post('/admin', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadBlogCover, createPost);
router.put('/admin/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadBlogCover, updatePost);
router.delete('/admin/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deletePost);

export default router;
