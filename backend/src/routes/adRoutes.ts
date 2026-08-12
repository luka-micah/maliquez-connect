import { Router } from 'express';
import {
  getActiveAds, getAllAds, getAd,
  createAd, updateAd, deleteAd,
} from '../controllers/adController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadSingleImage } from '../middlewares/upload.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/active', getActiveAds);
router.get('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getAllAds);
router.get('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getAd);
router.post('/', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadSingleImage, createAd);
router.put('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), uploadSingleImage, updateAd);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteAd);

export default router;
