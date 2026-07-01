import { Router } from 'express';
import { createComparison, getComparison, deleteComparison } from '../controllers/comparisonController.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/', authenticate, createComparison);
router.get('/:id', authenticate, getComparison);
router.delete('/:id', authenticate, deleteComparison);

export default router;
