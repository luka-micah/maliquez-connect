import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import { REVIEW_STATUS, LISTING_STATUS } from '../constants/listingStatus.js';
import type { AuthRequest } from '../types/index.js';
import type { Response, NextFunction } from 'express';

const updateListingRating = async (listingId: string): Promise<void> => {
  const stats = await prisma.review.aggregate({
    where: { listingId, status: REVIEW_STATUS.APPROVED },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      averageRating: stats._avg.rating
        ? Math.round(stats._avg.rating * 10) / 10
        : 0,
      reviewCount: stats._count,
    },
  });
};

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { rating, review } = req.body;
    const listingId = req.body.listingId || req.body.listing;

    if (!listingId) {
      throw ApiError.badRequest('Listing ID is required');
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.status !== LISTING_STATUS.APPROVED) {
      throw ApiError.notFound('Listing not found');
    }

    const existingReview = await prisma.review.findUnique({
      where: { userId_listingId: { userId: req.userId!, listingId } },
    });

    if (existingReview) {
      throw ApiError.conflict('You have already reviewed this listing');
    }

    const newReview = await prisma.review.create({
      data: {
        user: { connect: { id: req.userId! } },
        listing: { connect: { id: listingId } },
        rating: Number(rating),
        review: review || undefined,
      },
    });

    await updateListingRating(listingId);

    await prisma.notification.create({
      data: {
        user: { connect: { id: listing.ownerId } },
        title: 'New Review',
        message: `Your listing "${listing.title}" received a new review`,
        type: 'REVIEW',
        referenceId: listing.id,
        referenceModel: 'Listing',
      },
    });

    res.status(201).json(ApiResponse.created(newReview, 'Review created'));
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.userId !== req.userId) {
      throw ApiError.forbidden('You can only edit your own reviews');
    }

    const data: Record<string, unknown> = {};
    if (req.body.rating !== undefined) data.rating = Number(req.body.rating);
    if (req.body.review !== undefined) data.review = req.body.review;

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data,
    });

    await updateListingRating(review.listingId);

    res.json(ApiResponse.success(updated, 'Review updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    if (review.userId !== req.userId && req.userRole !== 'ADMIN') {
      throw ApiError.forbidden('You can only delete your own reviews');
    }

    const listingId = review.listingId;
    await prisma.review.delete({ where: { id: req.params.id } });
    await updateListingRating(listingId);

    res.json(ApiResponse.success(null, 'Review deleted'));
  } catch (error) {
    next(error);
  }
};

export const getListingReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);

    const where = {
      listingId: req.params.id,
      status: REVIEW_STATUS.APPROVED,
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(reviews, pagination));
  } catch (error) {
    next(error);
  }
};

export const markHelpful = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    const updated = await prisma.review.update({
      where: { id: req.params.id },
      data: { helpfulCount: { increment: 1 } },
    });

    res.json(ApiResponse.success({ helpfulCount: updated.helpfulCount }, 'Marked as helpful'));
  } catch (error) {
    next(error);
  }
};

export const reportReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
    });

    if (!review) {
      throw ApiError.notFound('Review not found');
    }

    await prisma.review.update({
      where: { id: req.params.id },
      data: { status: REVIEW_STATUS.PENDING },
    });

    res.json(ApiResponse.success(null, 'Review reported for moderation'));
  } catch (error) {
    next(error);
  }
};
