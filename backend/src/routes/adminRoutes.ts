import { Router } from 'express';
import {
  getUsers, getProviders, getAdminListings,
  approveListing, suspendListing, updateUserStatus,
  moderateReview, getPendingListings,
  getAdminDashboard, getProviderAnalytics,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.get('/providers', getProviders);
router.get('/listings', getAdminListings);
router.get('/listings/pending', getPendingListings);
router.put('/listings/:id/approve', approveListing);
router.put('/listings/:id/suspend', suspendListing);
router.put('/users/:id/status', updateUserStatus);
router.put('/reviews/:id/moderate', moderateReview);
router.get('/providers/:id/analytics', getProviderAnalytics);

export default router;
