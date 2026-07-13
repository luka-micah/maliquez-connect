import { Response, NextFunction } from 'express';
import { Prisma, Sector } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import { LISTING_STATUS } from '../constants/listingStatus.js';
import { parsePagination } from '../utils/helpers.js';
import type { AuthRequest } from '../types/index.js';

interface UserPreferences {
  preferredCategories: { categoryId: string; name: string; weight: number }[];
  preferredSectors: { sector: string; weight: number }[];
  preferredPriceRange: { min: number; max: number } | null;
  searchKeywords: string[];
}

interface ScoredListing {
  id: string;
  title: string;
  slug: string | null;
  description: string;
  categoryId: string;
  ownerId: string;
  sector: string;
  contact: unknown;
  location: unknown;
  images: string[];
  features: string[];
  pricing: unknown;
  operatingHours: unknown;
  averageRating: number;
  reviewCount: number;
  verified: string;
  status: string;
  category: { id: string; name: string; slug: string | null } | null;
  owner: { firstName: string; lastName: string } | null;
  createdAt: Date;
  updatedAt: Date;
  recommendationScore: number;
  matchReasons: string[];
}

const buildUserPreferences = async (userId: string): Promise<UserPreferences> => {
  const [favorites, searchHistory] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            categoryId: true,
            sector: true,
            pricing: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.searchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ]);

  const categoryMap = new Map<string, { name: string; count: number }>();
  const sectorMap = new Map<string, number>();
  let priceMinSum = 0;
  let priceMaxSum = 0;
  let priceCount = 0;

  for (const fav of favorites) {
    const catId = fav.listing.categoryId;
    const catName = fav.listing.category?.name || catId;
    const current = categoryMap.get(catId) || { name: catName, count: 0 };
    current.count++;
    categoryMap.set(catId, current);

    const sectorKey = fav.listing.sector;
    sectorMap.set(sectorKey, (sectorMap.get(sectorKey) || 0) + 1);

    const pricing = fav.listing.pricing as Record<string, unknown> | null;
    if (pricing) {
      const min = Number(pricing.minimum) || 0;
      const max = Number(pricing.maximum) || 0;
      if (min > 0) { priceMinSum += min; priceCount++; }
      if (max > 0) { priceMaxSum += max; }
    }
  }

  const preferredCategories = Array.from(categoryMap.entries())
    .map(([categoryId, { name, count }]) => ({
      categoryId,
      name,
      weight: count,
    }))
    .sort((a, b) => b.weight - a.weight);

  const preferredSectors = Array.from(sectorMap.entries())
    .map(([sector, count]) => ({ sector, weight: count }))
    .sort((a, b) => b.weight - a.weight);

  const preferredPriceRange = priceCount > 0
    ? { min: Math.round(priceMinSum / priceCount), max: priceMaxSum > 0 ? Math.round(priceMaxSum / priceCount) : Infinity }
    : null;

  const searchKeywords = searchHistory
    .filter((s) => s.keyword)
    .map((s) => s.keyword!.toLowerCase())
    .filter((k, i, arr) => arr.indexOf(k) === i)
    .slice(0, 10);

  return { preferredCategories, preferredSectors, preferredPriceRange, searchKeywords };
};

const calculatePersonalizedScore = (
  listing: {
    averageRating: number;
    reviewCount: number;
    verified: string;
    pricing: unknown;
    features: string[];
    categoryId: string;
    sector: string;
    description: string;
    title: string;
  },
  preferences: UserPreferences,
): { score: number; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];

  if (listing.averageRating >= 4) { score += 25; reasons.push('Highly rated'); }
  else if (listing.averageRating >= 3) { score += 10; }

  if (listing.reviewCount > 50) { score += 15; reasons.push('Popular choice'); }
  else if (listing.reviewCount > 10) { score += 8; }

  if (listing.verified === 'VERIFIED') { score += 20; reasons.push('Verified provider'); }

  const pricing = listing.pricing as Record<string, unknown> | null;
  if (pricing?.minimum) {
    const min = Number(pricing.minimum);
    if (min <= 10000) score += 10;
    else if (min <= 50000) score += 6;
    else score += 3;
  }

  if (listing.features && listing.features.length > 5) score += 8;
  else if (listing.features && listing.features.length > 2) score += 4;

  const matchedCategory = preferences.preferredCategories.find(
    (pc) => pc.categoryId === listing.categoryId,
  );
  if (matchedCategory) {
    const bonus = Math.min(matchedCategory.weight * 12, 30);
    score += bonus;
    reasons.push(`Matches your interest in ${matchedCategory.name}`);
  }

  const matchedSector = preferences.preferredSectors.find(
    (ps) => ps.sector === listing.sector,
  );
  if (matchedSector) {
    const bonus = Math.min(matchedSector.weight * 8, 20);
    score += bonus;
    reasons.push(`Similar to providers you follow`);
  }

  if (preferences.preferredPriceRange && pricing?.minimum) {
    const min = Number(pricing.minimum);
    const range = preferences.preferredPriceRange;
    if (range.max === Infinity) {
      if (min >= range.min * 0.7 && min <= range.min * 1.3) {
        score += 10;
        reasons.push('Within your preferred price range');
      }
    } else if (min >= range.min * 0.7 && min <= range.max * 1.3) {
      score += 10;
      reasons.push('Within your preferred price range');
    }
  }

  if (preferences.searchKeywords.length > 0) {
    const titleDesc = `${listing.title} ${listing.description}`.toLowerCase();
    const matchedKeywords = preferences.searchKeywords.filter(
      (kw) => titleDesc.includes(kw),
    );
    if (matchedKeywords.length > 0) {
      const bonus = Math.min(matchedKeywords.length * 8, 20);
      score += bonus;
      reasons.push(`Based on your recent searches`);
    }
  }

  if (reasons.length === 0) {
    reasons.push('Recommended for you');
  }

  return { score, reasons: reasons.slice(0, 3) };
};

export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sector, limit = 10 } = req.query;
    const takeLimit = Number(limit);
    const currentUserId = req.userId;

    const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.APPROVED };
    if (sector) where.sector = String(sector) as Sector;

    const [listings, preferences] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          owner: { select: { firstName: true, lastName: true } },
        },
      }),
      currentUserId ? buildUserPreferences(currentUserId) : Promise.resolve({
        preferredCategories: [],
        preferredSectors: [],
        preferredPriceRange: null,
        searchKeywords: [],
      } as UserPreferences),
    ]);

    const scored: ScoredListing[] = listings.map((listing) => {
      const { score, reasons } = calculatePersonalizedScore(listing, preferences);
      return {
        ...listing,
        recommendationScore: score,
        matchReasons: reasons,
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    const top = scored.slice(0, takeLimit);

    if (currentUserId && top.length > 0) {
      const recommendations = top.map((l) => ({
        userId: currentUserId,
        listingId: l.id,
        reason: l.matchReasons.join(', '),
        score: l.recommendationScore,
      }));

      await prisma.$transaction([
        prisma.recommendation.deleteMany({ where: { userId: currentUserId } }),
        prisma.recommendation.createMany({ data: recommendations }),
      ]);
    }

    res.json(ApiResponse.success(top));
  } catch (error) {
    next(error);
  }
};

export const getRecommendationsByBudget = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { budget, state, sector } = req.query;

    const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.APPROVED };
    if (sector) where.sector = String(sector) as Sector;

    const [listings, preferences] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          owner: { select: { firstName: true, lastName: true } },
        },
        orderBy: { averageRating: 'desc' },
      }),
      req.userId ? buildUserPreferences(req.userId) : Promise.resolve({
        preferredCategories: [],
        preferredSectors: [],
        preferredPriceRange: null,
        searchKeywords: [],
      } as UserPreferences),
    ]);

    const filtered = listings.filter((listing) => {
      const location = listing.location as Record<string, unknown> | null;
      const pricing = listing.pricing as Record<string, unknown> | null;

      if (state && location?.state) {
        if (!String(location.state).toLowerCase().includes(String(state).toLowerCase())) return false;
      }
      if (budget && pricing?.minimum && Number(pricing.minimum) > Number(budget)) return false;

      return true;
    });

    const top = filtered.slice(0, 10);

    const result = top.map((l) => {
      const pricing = l.pricing as Record<string, unknown> | null;
      const { score, reasons } = calculatePersonalizedScore(l, preferences);

      let reason: string;
      if (budget && pricing?.minimum && Number(pricing.minimum) <= Number(budget)) {
        reason = `Within budget (${pricing.currency || 'NGN'} ${pricing.minimum})`;
      } else {
        reason = reasons.join(', ');
      }

      return { ...l, recommendationScore: score, matchReasons: [reason] };
    });

    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};

export const getPreferenceProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.json(ApiResponse.success(null));
      return;
    }

    const preferences = await buildUserPreferences(req.userId);
    res.json(ApiResponse.success({
      categories: preferences.preferredCategories.map((c) => ({ id: c.categoryId, name: c.name })),
      sectors: preferences.preferredSectors.map((s) => ({ name: s.sector })),
      priceRange: preferences.preferredPriceRange,
      recentSearches: preferences.searchKeywords,
    }));
  } catch (error) {
    next(error);
  }
};
