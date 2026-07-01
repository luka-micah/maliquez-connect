import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { LISTING_STATUS } from '../constants/listingStatus.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import type { AuthRequest } from '../types/index.js';

export const addFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId } = req.body;

    const listing = await prisma.listing.findFirst({
      where: { id: listingId, status: LISTING_STATUS.APPROVED },
    });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: req.userId!, listingId } },
    });

    if (existing) {
      return res.json(ApiResponse.success(existing, 'Already in favorites'));
    }

    const favorite = await prisma.favorite.create({
      data: {
        user: { connect: { id: req.userId! } },
        listing: { connect: { id: listingId } },
      },
    });

    res.status(201).json(ApiResponse.created(favorite, 'Added to favorites'));
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.favorite.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (result.count === 0) {
      throw ApiError.notFound('Favorite not found');
    }

    res.json(ApiResponse.success(null, 'Removed from favorites'));
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = parsePagination(req.query);
    const skip = (page - 1) * limit;

    const total = await prisma.favorite.count({
      where: {
        userId: req.userId,
        listing: { status: LISTING_STATUS.APPROVED },
      },
    });

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: req.userId,
        listing: { status: LISTING_STATUS.APPROVED },
      },
      include: {
        listing: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const pagination = calculatePagination(page, limit, total);

    res.json(ApiResponse.paginated(favorites, pagination));
  } catch (error) {
    next(error);
  }
};
