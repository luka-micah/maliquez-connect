import { Router } from 'express';
import {
  getListings, getListing, createListing,
  updateListing, deleteListing, getMyListings,
} from '../controllers/listingController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadMultiple } from '../middlewares/upload.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/', getListings);
router.get('/mine', authenticate, getMyListings);
router.get('/:id', getListing);
router.post('/', authenticate, authorize(ROLES.PROVIDER, ROLES.ADMIN), uploadMultiple, createListing);
router.put('/:id', authenticate, authorize(ROLES.PROVIDER, ROLES.ADMIN), uploadMultiple, updateListing);
router.delete('/:id', authenticate, authorize(ROLES.PROVIDER, ROLES.ADMIN), deleteListing);

export default router;
