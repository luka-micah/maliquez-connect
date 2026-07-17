import { Router } from 'express';
import {
  getActiveAds, getAllAds, getAd,
  createAd, updateAd, deleteAd,
} from '../controllers/adController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/active', getActiveAds);
router.get('/', authenticate, authorize(ROLES.ADMIN), getAllAds);
router.get('/:id', authenticate, authorize(ROLES.ADMIN), getAd);
router.post('/', authenticate, authorize(ROLES.ADMIN), createAd);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), updateAd);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), deleteAd);

export default router;
