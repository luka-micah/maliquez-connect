import { Router, Response, NextFunction } from 'express';
import {
  getAgentProfile, updateAgentProfile, getAgentDashboard,
  getAgentProviders, getAgentProvider, createProvider,
  updateProvider, updateProviderStatus, sendInvitation,
  resendInvitation, createFollowUp, getActivities, getFollowUps,
} from '../controllers/agentController.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { ROLES } from '../constants/roles.js';
import prisma from '../config/prisma.js';
import type { AuthRequest } from '../types/index.js';

const router = Router();

const ensureAgentProfile = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    if (req.userRole === ROLES.ADMIN) return next();
    let agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (!user) return next(new Error('User not found'));

      const lastAgent = await prisma.agentProfile.findFirst({ orderBy: { createdAt: 'desc' } });
      let nextNum = 1;
      if (lastAgent) {
        const match = lastAgent.referralCode.match(/MCAG-(\d+)/);
        if (match) nextNum = parseInt(match[1], 10) + 1;
      }
      const referralCode = `MCAG-${String(nextNum).padStart(4, '0')}`;

      agent = await prisma.agentProfile.create({
        data: {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          referralCode,
          status: 'ACTIVE',
        },
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

router.use(authenticate, authorize(ROLES.AGENT, ROLES.ADMIN), ensureAgentProfile);

router.get('/profile', getAgentProfile);
router.put('/profile', updateAgentProfile);
router.get('/dashboard', getAgentDashboard);
router.get('/providers', getAgentProviders);
router.get('/providers/:id', getAgentProvider);
router.post('/providers', createProvider);
router.put('/providers/:id', updateProvider);
router.put('/providers/:id/status', updateProviderStatus);
router.post('/providers/:id/invite', sendInvitation);
router.post('/providers/:id/resend-invitation', resendInvitation);
router.post('/follow-ups', createFollowUp);
router.get('/activities', getActivities);
router.get('/follow-ups', getFollowUps);

export default router;
