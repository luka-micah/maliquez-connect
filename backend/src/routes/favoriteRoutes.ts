import { Router } from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favoriteController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticate, getFavorites);
router.post('/', authenticate, addFavorite);
router.delete('/:id', authenticate, removeFavorite);

export default router;
