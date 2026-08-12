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
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createCategory);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), updateCategory);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteCategory);

export default router;
