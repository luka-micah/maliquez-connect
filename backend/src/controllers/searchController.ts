import { Response, NextFunction } from 'express';
import { Prisma, Sector } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import { LISTING_STATUS } from '../constants/listingStatus.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import { getCachedData, cacheData } from '../config/redis.js';
import type { AuthRequest } from '../types/index.js';

export const search = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      q,
      sector,
      category,
      state,
      city,
      minRating,
      maxPrice,
      minPrice,
      features,
      sort = '-averageRating',
    } = req.query;

    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.APPROVED };

    if (q) {
      where.OR = [
        { title: { contains: q as string, mode: 'insensitive' } },
        { description: { contains: q as string, mode: 'insensitive' } },
      ];
    }

    if (sector) where.sector = String(sector) as Sector;
    if (category) where.categoryId = category as string;
    if (minRating) where.averageRating = { gte: Number(minRating) };

    const sortStr = sort as string;
    const sortField = sortStr.startsWith('-') ? sortStr.slice(1) : sortStr;
    const sortOrder = sortStr.startsWith('-') ? 'desc' : 'asc';
    const orderBy: Prisma.ListingOrderByWithRelationInput = {};
    if (sortField === 'averageRating') orderBy.averageRating = sortOrder;
    else if (sortField === 'createdAt') orderBy.createdAt = sortOrder;
    else if (sortField === 'reviewCount') orderBy.reviewCount = sortOrder;
    else if (sortField === 'title') orderBy.title = sortOrder;
    else orderBy.averageRating = 'desc';

    const allListings = await prisma.listing.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy,
    });

    const filtered = allListings.filter((listing) => {
      const location = listing.location as Record<string, unknown> | null;
      const pricing = listing.pricing as Record<string, unknown> | null;

      if (state && location?.state) {
        if (!String(location.state).toLowerCase().includes(String(state).toLowerCase())) return false;
      }
      if (city && location?.city) {
        if (!String(location.city).toLowerCase().includes(String(city).toLowerCase())) return false;
      }
      if (minPrice && pricing?.minimum && Number(pricing.minimum) < Number(minPrice)) return false;
      if (maxPrice && pricing?.minimum && Number(pricing.minimum) > Number(maxPrice)) return false;
      if (features) {
        const featureList = String(features).split(',');
        const listingFeatures = listing.features || [];
        if (!featureList.some((f) => listingFeatures.includes(f))) return false;
      }
      return true;
    });

    const total = filtered.length;
    const listings = filtered.slice(skip, skip + limit);

    if (req.userId && q) {
      await prisma.searchHistory.create({
        data: {
          user: { connect: { id: req.userId } },
          keyword: q as string,
          filters: { sector, category, state, city },
        },
      });
    }

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(listings, pagination));
  } catch (error) {
    next(error);
  }
};

export const getSuggestions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || (q as string).length < 2) {
      res.json(ApiResponse.success([]));
      return;
    }

    const cacheKey = `suggestions:${(q as string).toLowerCase()}`;
    const cached = await getCachedData(cacheKey);
    if (cached) {
      res.json(ApiResponse.success(cached));
      return;
    }

    const suggestions = await prisma.listing.findMany({
      where: {
        status: LISTING_STATUS.APPROVED,
        title: { contains: q as string, mode: 'insensitive' },
      },
      select: { title: true, slug: true, sector: true },
      take: 8,
    });

    await cacheData(cacheKey, suggestions, 300);

    res.json(ApiResponse.success(suggestions));
  } catch (error) {
    next(error);
  }
};

export const getTrending = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cached = await getCachedData('search:trending');
    if (cached) {
      res.json(ApiResponse.success(cached));
      return;
    }

    const trending = await prisma.listing.findMany({
      where: { status: LISTING_STATUS.APPROVED },
      orderBy: [{ reviewCount: 'desc' }, { averageRating: 'desc' }],
      select: {
        title: true,
        slug: true,
        sector: true,
        averageRating: true,
        reviewCount: true,
        images: true,
      },
      take: 10,
    });

    await cacheData('search:trending', trending, 1800);

    res.json(ApiResponse.success(trending));
  } catch (error) {
    next(error);
  }
};

export const getRecent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.json(ApiResponse.success([]));
      return;
    }

    const recent = await prisma.searchHistory.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      select: { keyword: true, filters: true, createdAt: true },
      take: 10,
    });

    res.json(ApiResponse.success(recent));
  } catch (error) {
    next(error);
  }
};
