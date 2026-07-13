import { Router } from 'express';
import { getRecommendations, getRecommendationsByBudget, getPreferenceProfile } from '../controllers/recommendationController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, getRecommendations);
router.get('/by-budget', authenticate, getRecommendationsByBudget);
router.get('/preferences', authenticate, getPreferenceProfile);

export default router;
