import { Router } from 'express';
import { getRecommendations, getRecommendationsByBudget } from '../controllers/recommendationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, getRecommendations);
router.get('/by-budget', authenticate, getRecommendationsByBudget);

export default router;
