import { Router } from 'express';
import {
  getCategories, getCategory, createCategory,
  updateCategory, deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', getCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, authorize(ROLES.ADMIN), createCategory);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), updateCategory);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), deleteCategory);

export default router;
