import { Router } from 'express';
import {
  getUsers, getProviders, getAdminListings, getReviews,
  approveListing, suspendListing, updateUserStatus,
  updateProviderVerification, moderateReview, getPendingListings,
  getAdminDashboard, getProviderAnalytics,
  getAgents, updateAgentStatus, reassignProvider,
  approveProvider, rejectProvider, publishProvider,
  getAdminReports, getAuditLogs, resetOnboarding, getAdminAllProviders,
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
router.put('/providers/:id/verify', updateProviderVerification);
router.get('/reviews', getReviews);
router.put('/reviews/:id/moderate', moderateReview);
router.get('/providers/:id/analytics', getProviderAnalytics);

router.get('/agents', getAgents);
router.put('/agents/:id/status', updateAgentStatus);
router.put('/onboardings/:id/reassign', reassignProvider);
router.put('/onboardings/:id/approve', approveProvider);
router.put('/onboardings/:id/reject', rejectProvider);
router.put('/onboardings/:id/publish', publishProvider);
router.put('/onboardings/:id/reset', resetOnboarding);
router.get('/onboardings', getAdminAllProviders);
router.get('/reports', getAdminReports);
router.get('/audit-logs', getAuditLogs);

export default router;
