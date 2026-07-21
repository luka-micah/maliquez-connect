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
