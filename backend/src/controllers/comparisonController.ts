import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { LISTING_STATUS } from '../constants/listingStatus.js';
import type { AuthRequest } from '../types/index.js';

export const createComparison = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listings } = req.body;

    if (!listings || listings.length < 2) {
      throw ApiError.badRequest('At least 2 listings are required for comparison');
    }

    if (listings.length > 5) {
      throw ApiError.badRequest('Maximum 5 listings can be compared at once');
    }

    const validListings = await prisma.listing.findMany({
      where: {
        id: { in: listings },
        status: LISTING_STATUS.APPROVED,
      },
    });

    if (validListings.length !== listings.length) {
      throw ApiError.badRequest('One or more listings not found');
    }

    const comparison = await prisma.comparison.create({
      data: {
        user: { connect: { id: req.userId! } },
        listingIds: listings,
      },
    });

    const populatedListings = await prisma.listing.findMany({
      where: { id: { in: comparison.listingIds } },
      include: { category: { select: { name: true, slug: true } } },
    });

    const result = {
      ...comparison,
      listings: populatedListings,
    };

    res.status(201).json(ApiResponse.created(result, 'Comparison created'));
  } catch (error) {
    next(error);
  }
};

export const getComparison = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const comparison = await prisma.comparison.findUnique({
      where: { id: req.params.id },
    });

    if (!comparison) {
      throw ApiError.notFound('Comparison not found');
    }

    if (comparison.userId !== req.userId && req.userRole !== 'ADMIN') {
      throw ApiError.forbidden('Access denied');
    }

    const listings = await prisma.listing.findMany({
      where: { id: { in: comparison.listingIds } },
      include: {
        category: { select: { name: true, slug: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
    });

    const comparisonData = {
      id: comparison.id,
      createdAt: comparison.createdAt,
      fields: extractComparisonFields(listings as ListingWithCategory[]),
    };

    res.json(ApiResponse.success(comparisonData));
  } catch (error) {
    next(error);
  }
};

export const deleteComparison = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await prisma.comparison.deleteMany({
      where: { id: req.params.id, userId: req.userId },
    });

    if (result.count === 0) {
      throw ApiError.notFound('Comparison not found');
    }

    res.json(ApiResponse.success(null, 'Comparison deleted'));
  } catch (error) {
    next(error);
  }
};

type ListingWithCategory = Record<string, unknown> & {
  id: string;
  title: string;
  sector: string;
  category?: { name: string; slug: string | null } | null;
  averageRating: number;
  reviewCount: number;
  location?: Record<string, unknown> | null;
  pricing?: Record<string, unknown> | null;
  features: string[];
  verified: string;
  images: string[];
};

const extractComparisonFields = (listings: ListingWithCategory[]) => {
  const fields = {
    title: listings.map((l) => l.title),
    sector: listings.map((l) => l.sector),
    category: listings.map((l) => l.category?.name || 'N/A'),
    rating: listings.map((l) => l.averageRating),
    reviewCount: listings.map((l) => l.reviewCount),
    location: listings.map((l) =>
      `${l.location?.city || ''}, ${l.location?.state || ''}`
    ),
    pricing: listings.map((l) =>
      l.pricing?.minimum
        ? `${l.pricing.currency || 'NGN'} ${l.pricing.minimum} - ${l.pricing.maximum || 'N/A'}`
        : 'N/A'
    ),
    features: listings.map((l) => l.features || []),
    verified: listings.map((l) => l.verified),
    images: listings.map((l) => l.images?.[0] || ''),
  };

  return fields;
};
