import { Router } from 'express';
import { search, getSuggestions, getTrending, getRecent } from '../controllers/searchController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', search);
router.get('/suggestions', getSuggestions);
router.get('/trending', getTrending);
router.get('/recent', authenticate, getRecent);

export default router;
