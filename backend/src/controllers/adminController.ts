import { Prisma, Role, UserStatus, ListingStatus, Sector, ReviewStatus } from '@prisma/client';
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import { LISTING_STATUS, REVIEW_STATUS } from '../constants/listingStatus.js';
import { ROLES } from '../constants/roles.js';
import { invalidateCache } from '../config/redis.js';
import {
  sendListingApprovedEmail,
  sendListingSuspendedEmail,
} from '../services/emailService.js';
import type { AuthRequest } from '../types/index.js';

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role as Role;
    if (status) where.status = status as UserStatus;
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(users, pagination));
  } catch (error) {
    next(error);
  }
};

export const getProviders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { verificationStatus } = req.query;
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: Prisma.UserWhereInput = { role: ROLES.PROVIDER };

    const allProviders = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const filtered = allProviders.filter((provider) => {
      if (verificationStatus) {
        const profile = provider.providerProfile as Record<string, unknown> | null;
        if (!profile || profile.verificationStatus !== verificationStatus) return false;
      }
      return true;
    });

    const total = filtered.length;
    const providers = filtered.slice(skip, skip + limit);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(providers, pagination));
  } catch (error) {
    next(error);
  }
};

export const getAdminListings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, sector } = req.query;
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: Prisma.ListingWhereInput = {};
    if (status) where.status = String(status) as ListingStatus;
    if (sector) where.sector = String(sector) as Sector;

    const total = await prisma.listing.count({ where });
    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(listings, pagination));
  } catch (error) {
    next(error);
  }
};

export const approveListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED' },
    });

    await prisma.notification.create({
      data: {
        user: { connect: { id: listing.ownerId } },
        title: 'Listing Approved',
        message: `Your listing "${listing.title}" has been approved`,
        type: 'APPROVAL',
        referenceId: listing.id,
        referenceModel: 'Listing',
      },
    });

    await invalidateCache('listings:*');

    prisma.user.findUnique({ where: { id: listing.ownerId }, select: { email: true, firstName: true } }).then(owner => {
      if (owner) {
        sendListingApprovedEmail({
          email: owner.email,
          firstName: owner.firstName,
          listingTitle: listing.title,
          listingId: listing.id,
        });
      }
    }).catch(() => {});

    res.json(ApiResponse.success(updated, 'Listing approved'));
  } catch (error) {
    next(error);
  }
};

export const suspendListing = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: { status: 'SUSPENDED' },
    });

    await prisma.notification.create({
      data: {
        user: { connect: { id: listing.ownerId } },
        title: 'Listing Suspended',
        message: `Your listing "${listing.title}" has been suspended`,
        type: 'APPROVAL',
        referenceId: listing.id,
        referenceModel: 'Listing',
      },
    });

    await invalidateCache('listings:*');

    prisma.user.findUnique({ where: { id: listing.ownerId }, select: { email: true, firstName: true } }).then(owner => {
      if (owner) {
        sendListingSuspendedEmail({
          email: owner.email,
          firstName: owner.firstName,
          listingTitle: listing.title,
        });
      }
    }).catch(() => {});

    res.json(ApiResponse.success(updated, 'Listing suspended'));
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existingUser) {
      throw ApiError.notFound('User not found');
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(ApiResponse.success(user, 'User status updated'));
  } catch (error) {
    next(error);
  }
};

export const getReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: Prisma.ReviewWhereInput = {};
    if (status) where.status = String(status) as ReviewStatus;

    const total = await prisma.review.count({ where });
    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        listing: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(reviews, pagination));
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;

    const existingReview = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!existingReview) {
      throw ApiError.notFound('Review not found');
    }

    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(ApiResponse.success(review, `Review ${(status as string).toLowerCase()}`));
  } catch (error) {
    next(error);
  }
};

export const getPendingListings = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.PENDING };

    const total = await prisma.listing.count({ where });
    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(listings, pagination));
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [totalUsers, totalProviders, totalListings, totalReviews, pendingListings, pendingReviews] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'PROVIDER' } }),
        prisma.listing.count(),
        prisma.review.count(),
        prisma.listing.count({ where: { status: 'PENDING' } }),
        prisma.review.count({ where: { status: 'PENDING' } }),
      ]);

    res.json(
      ApiResponse.success({
        totalUsers,
        totalProviders,
        totalListings,
        totalReviews,
        pendingListings,
        pendingReviews,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const updateProviderVerification = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { verificationStatus } = req.body;

    const provider = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!provider || provider.role !== ROLES.PROVIDER) {
      throw ApiError.notFound('Provider not found');
    }

    const currentProfile = provider.providerProfile as Record<string, unknown> | null || {};
    
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        providerProfile: {
          ...currentProfile,
          verificationStatus,
        },
      },
    });

    await prisma.notification.create({
      data: {
        user: { connect: { id: provider.id } },
        title: 'Verification Status Updated',
        message: `Your provider verification status has been updated to ${verificationStatus}`,
        type: 'APPROVAL',
        referenceId: provider.id,
        referenceModel: 'User',
      },
    });

    res.json(ApiResponse.success(updated, `Provider verification updated to ${verificationStatus}`));
  } catch (error) {
    next(error);
  }
};

export const getAgents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
    const { status, search } = req.query;

    const where: any = {};
    if (status) where.status = status as string;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { referralCode: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.agentProfile.count({ where });
    const agents = await prisma.agentProfile.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, status: true, createdAt: true } },
        _count: { select: { providerOnboardings: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(agents, pagination));
  } catch (error) {
    next(error);
  }
};

export const updateAgentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const agent = await prisma.agentProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { status: true } } },
    });
    if (!agent) throw ApiError.notFound('Agent not found');

    const prevStatus = agent.status;
    const [updated] = await prisma.$transaction([
      prisma.agentProfile.update({
        where: { id: req.params.id },
        data: { status },
      }),
      prisma.user.update({
        where: { id: agent.userId },
        data: { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'STATUS_CHANGE',
        entityType: 'AgentProfile',
        entityId: agent.id,
        previousValue: { status: prevStatus, userStatus: agent.user.status },
        newValue: { status, userStatus: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' },
      },
    });

    res.json(ApiResponse.success(updated, `Agent ${status.toLowerCase()}`));
  } catch (error) {
    next(error);
  }
};

export const reassignProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { agentId } = req.body;
    const onboarding = await prisma.providerOnboarding.findUnique({ where: { id: req.params.id } });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    const newAgent = await prisma.agentProfile.findUnique({ where: { id: agentId } });
    if (!newAgent) throw ApiError.notFound('New agent not found');

    const prevAgentId = onboarding.agentId;
    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: { agentId },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'REASSIGNMENT',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        previousValue: { agentId: prevAgentId },
        newValue: { agentId },
      },
    });

    await prisma.notification.create({
      data: {
        userId: onboarding.providerId,
        title: 'Provider Reassigned',
        message: `Your onboarding has been reassigned to a new agent.`,
        type: 'ONBOARDING',
        referenceId: onboarding.id,
        referenceModel: 'ProviderOnboarding',
      },
    });

    if (newAgent) {
      await prisma.notification.create({
        data: {
          userId: newAgent.userId,
          title: 'Provider Assigned',
          message: `"${onboarding.businessName}" has been assigned to you.`,
          type: 'ONBOARDING',
          referenceId: onboarding.id,
          referenceModel: 'ProviderOnboarding',
        },
      });
    }

    res.json(ApiResponse.success(updated, 'Provider reassigned'));
  } catch (error) {
    next(error);
  }
};

export const approveProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const onboarding = await prisma.providerOnboarding.findUnique({ where: { id: req.params.id } });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    if (onboarding.onboardingStatus !== 'UNDER_REVIEW' && onboarding.onboardingStatus !== 'DOCUMENTS_SUBMITTED') {
      throw ApiError.badRequest('Provider must be under review to approve');
    }

    const prevStatus = onboarding.onboardingStatus;
    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: { onboardingStatus: 'APPROVED', approvedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'APPROVAL',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        previousValue: { onboardingStatus: prevStatus },
        newValue: { onboardingStatus: 'APPROVED' },
      },
    });

    await prisma.notification.create({
      data: {
        userId: onboarding.providerId,
        title: 'Provider Approved',
        message: `Your business "${onboarding.businessName}" has been approved. You are now live!`,
        type: 'APPROVAL',
        referenceId: onboarding.id,
        referenceModel: 'ProviderOnboarding',
      },
    });

    res.json(ApiResponse.success(updated, 'Provider approved'));
  } catch (error) {
    next(error);
  }
};

export const rejectProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const onboarding = await prisma.providerOnboarding.findUnique({ where: { id: req.params.id } });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    if (onboarding.onboardingStatus !== 'UNDER_REVIEW' && onboarding.onboardingStatus !== 'DOCUMENTS_SUBMITTED') {
      throw ApiError.badRequest('Provider must be under review to reject');
    }

    const prevStatus = onboarding.onboardingStatus;
    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: { onboardingStatus: 'REJECTED', rejectedAt: new Date(), rejectedReason: reason },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'STATUS_CHANGE',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        previousValue: { onboardingStatus: prevStatus },
        newValue: { onboardingStatus: 'REJECTED', reason },
      },
    });

    await prisma.notification.create({
      data: {
        userId: onboarding.providerId,
        title: 'Provider Rejected',
        message: `Your business "${onboarding.businessName}" has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
        type: 'APPROVAL',
        referenceId: onboarding.id,
        referenceModel: 'ProviderOnboarding',
      },
    });

    res.json(ApiResponse.success(updated, 'Provider rejected'));
  } catch (error) {
    next(error);
  }
};

export const publishProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const onboarding = await prisma.providerOnboarding.findUnique({ where: { id: req.params.id } });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    if (onboarding.onboardingStatus !== 'APPROVED') {
      throw ApiError.badRequest('Provider must be approved to publish');
    }

    const prevStatus = onboarding.onboardingStatus;
    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: { onboardingStatus: 'PUBLISHED' },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'APPROVAL',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        previousValue: { onboardingStatus: prevStatus },
        newValue: { onboardingStatus: 'PUBLISHED' },
      },
    });

    await prisma.notification.create({
      data: {
        userId: onboarding.providerId,
        title: 'Business Published',
        message: `Your business "${onboarding.businessName}" is now live on Maliquez Connect!`,
        type: 'APPROVAL',
        referenceId: onboarding.id,
        referenceModel: 'ProviderOnboarding',
      },
    });

    res.json(ApiResponse.success(updated, 'Provider published'));
  } catch (error) {
    next(error);
  }
};

export const getAdminReports = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allOnboardings = await prisma.providerOnboarding.findMany();

    const totalProviders = allOnboardings.length;
    const pendingApproval = allOnboardings.filter(o => ['DOCUMENTS_SUBMITTED', 'UNDER_REVIEW'].includes(o.onboardingStatus)).length;
    const approved = allOnboardings.filter(o => o.onboardingStatus === 'APPROVED' || o.onboardingStatus === 'PUBLISHED').length;
    const rejected = allOnboardings.filter(o => o.onboardingStatus === 'REJECTED').length;
    const invited = allOnboardings.filter(o => o.onboardingStatus === 'INVITED').length;
    const claimed = allOnboardings.filter(o => o.onboardingStatus === 'ACCOUNT_CLAIMED' || o.onboardingStatus === 'PROFILE_COMPLETED' || o.onboardingStatus === 'DOCUMENTS_SUBMITTED' || o.onboardingStatus === 'UNDER_REVIEW').length;

    const completed = allOnboardings.filter(o => o.onboardingStatus === 'APPROVED' || o.onboardingStatus === 'PUBLISHED');
    const completionRate = totalProviders > 0 ? Math.round((completed.length / totalProviders) * 100) : 0;

    const approvedWithDates = allOnboardings.filter(o => o.approvedAt && o.createdAt);
    const avgApprovalTimeMs = approvedWithDates.length > 0
      ? approvedWithDates.reduce((sum, o) => sum + (o.approvedAt!.getTime() - o.createdAt.getTime()), 0) / approvedWithDates.length
      : 0;
    const averageApprovalTime = Math.round(avgApprovalTimeMs / (1000 * 60 * 60 * 24)); // in days

    const claimedWithDates = allOnboardings.filter(o => o.claimedAt && o.createdAt);
    const avgOnboardingTimeMs = claimedWithDates.length > 0
      ? claimedWithDates.reduce((sum, o) => sum + (o.claimedAt!.getTime() - o.createdAt.getTime()), 0) / claimedWithDates.length
      : 0;
    const averageOnboardingTime = Math.round(avgOnboardingTimeMs / (1000 * 60 * 60 * 24));

    const agentsWithCounts = await prisma.agentProfile.findMany({
      include: {
        _count: { select: { providerOnboardings: true } },
      },
    });

    const agentRankings = await Promise.all(
      agentsWithCounts.map(async (agent) => {
        const agentOnboardings = await prisma.providerOnboarding.findMany({
          where: { agentId: agent.id },
        });
        return {
          agentId: agent.id,
          name: agent.name,
          totalRegistered: agentOnboardings.length,
          approvedCount: agentOnboardings.filter(o => o.onboardingStatus === 'APPROVED' || o.onboardingStatus === 'PUBLISHED').length,
        };
      })
    );

    agentRankings.sort((a, b) => b.approvedCount - a.approvedCount);

    const stateCounts: Record<string, number> = {};
    const lgaCounts: Record<string, number> = {};
    allOnboardings.forEach(o => {
      if (o.state) stateCounts[o.state] = (stateCounts[o.state] || 0) + 1;
      if (o.lga) lgaCounts[o.lga] = (lgaCounts[o.lga] || 0) + 1;
    });

    const statePerformance = Object.entries(stateCounts).map(([state, count]) => ({ state, count }));
    const lgaPerformance = Object.entries(lgaCounts).map(([lga, count]) => ({ lga, count }));

    const monthlyGrowth = await prisma.$queryRaw`
      SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*)::int as count
      FROM provider_onboardings
      GROUP BY month ORDER BY month
    `;

    res.json(ApiResponse.success({
      totalProviders,
      pendingApproval,
      approved,
      rejected,
      invited,
      claimed,
      completionRate,
      averageApprovalTime,
      averageOnboardingTime,
      agentRankings,
      statePerformance,
      lgaPerformance,
      monthlyGrowth: monthlyGrowth as any[],
    }));
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
    const { action, entityType } = req.query;

    const where: any = {};
    if (action) where.action = action as string;
    if (entityType) where.entityType = entityType as string;

    const total = await prisma.auditLog.count({ where });
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        agent: { select: { id: true, name: true, referralCode: true } },
      },
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(logs, pagination));
  } catch (error) {
    next(error);
  }
};

export const resetOnboarding = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const onboarding = await prisma.providerOnboarding.findUnique({ where: { id: req.params.id } });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    const prevStatus = onboarding.onboardingStatus;
    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: {
        onboardingStatus: 'PROSPECT',
        invitedAt: null,
        claimedAt: null,
        approvedAt: null,
        rejectedAt: null,
        rejectedReason: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.userId,
        action: 'STATUS_CHANGE',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        previousValue: { onboardingStatus: prevStatus },
        newValue: { onboardingStatus: 'PROSPECT' },
      },
    });

    res.json(ApiResponse.success(updated, 'Onboarding reset'));
  } catch (error) {
    next(error);
  }
};

export const getAdminAllProviders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
    const { status, state, lga, category, agentId, search } = req.query;

    const where: any = {};
    if (status) where.onboardingStatus = status as string;
    if (state) where.state = state as string;
    if (lga) where.lga = lga as string;
    if (category) where.category = category as string;
    if (agentId) where.agentId = agentId as string;
    if (search) {
      where.OR = [
        { businessName: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.providerOnboarding.count({ where });
    const providers = await prisma.providerOnboarding.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: {
        agent: { select: { id: true, name: true, referralCode: true } },
        provider: { select: { id: true, firstName: true, lastName: true, email: true, status: true } },
        documents: { select: { id: true, documentType: true, status: true } },
      },
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(providers, pagination));
  } catch (error) {
    next(error);
  }
};

export const getProviderAnalytics = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id || req.userId;

    const listings = await prisma.listing.findMany({
      where: { ownerId: userId as string },
    });

    const listingIds = listings.map((l) => l.id);

    const totalReviews = await prisma.review.count({
      where: { listingId: { in: listingIds } },
    });

    const avgRating =
      listings.reduce((sum, l) => sum + l.averageRating, 0) / (listings.length || 1);

    res.json(
      ApiResponse.success({
        totalListings: listings.length,
        totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        listingsByStatus: {
          pending: listings.filter((l) => l.status === 'PENDING').length,
          approved: listings.filter((l) => l.status === 'APPROVED').length,
          suspended: listings.filter((l) => l.status === 'SUSPENDED').length,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};
