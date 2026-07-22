import { Router } from 'express';
import {
  claimAccount, completeProfile, uploadDocuments, getMyProfile,
} from '../controllers/providerOnboardingController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.post('/claim', claimAccount);
router.put('/profile', authenticate, authorize(ROLES.PROVIDER), completeProfile);
router.post('/upload-documents', authenticate, authorize(ROLES.PROVIDER), uploadDocuments);
router.get('/my-onboarding', authenticate, authorize(ROLES.PROVIDER), getMyProfile);

export default router;
