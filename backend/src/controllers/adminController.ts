import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import { LISTING_STATUS, REVIEW_STATUS } from '../constants/listingStatus.js';
import { ROLES } from '../constants/roles.js';
import { invalidateCache } from '../config/redis.js';

interface AuthRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: string;
}

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, status, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: any = {};

    if (role) where.role = role as string;
    if (status) where.status = status as string;
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

    const where: any = { role: ROLES.PROVIDER };

    const allProviders = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const filtered = allProviders.filter((provider) => {
      if (verificationStatus) {
        const profile = provider.providerProfile as Record<string, any> | null;
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

    const where: any = {};
    if (status) where.status = status as string;
    if (sector) where.sector = sector as string;

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
      data: { status: LISTING_STATUS.APPROVED as any },
    });

    await prisma.notification.create({
      data: {
        user: { connect: { id: listing.ownerId } },
        title: 'Listing Approved',
        message: `Your listing "${listing.title}" has been approved`,
        type: 'APPROVAL' as any,
        referenceId: listing.id,
        referenceModel: 'Listing',
      },
    });

    await invalidateCache('listings:*');

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
      data: { status: LISTING_STATUS.SUSPENDED as any },
    });

    await prisma.notification.create({
      data: {
        user: { connect: { id: listing.ownerId } },
        title: 'Listing Suspended',
        message: `Your listing "${listing.title}" has been suspended`,
        type: 'APPROVAL' as any,
        referenceId: listing.id,
        referenceModel: 'Listing',
      },
    });

    await invalidateCache('listings:*');

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

    const where: any = { status: LISTING_STATUS.PENDING };

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
        prisma.user.count({ where: { role: ROLES.PROVIDER as any } }),
        prisma.listing.count(),
        prisma.review.count(),
        prisma.listing.count({ where: { status: LISTING_STATUS.PENDING as any } }),
        prisma.review.count({ where: { status: REVIEW_STATUS.PENDING as any } }),
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
