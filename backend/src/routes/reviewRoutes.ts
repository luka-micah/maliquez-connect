import { Router } from 'express';
import {
  createReview, updateReview, deleteReview,
  getListingReviews, markHelpful, reportReview,
} from '../controllers/reviewController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/listing/:id', getListingReviews);
router.post('/', authenticate, createReview);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/helpful', authenticate, markHelpful);
router.post('/:id/report', authenticate, reportReview);

export default router;
