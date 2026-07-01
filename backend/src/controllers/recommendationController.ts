import { Response, NextFunction } from 'express';
import { Prisma, Sector } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import { LISTING_STATUS } from '../constants/listingStatus.js';
import { parsePagination } from '../utils/helpers.js';
import type { AuthRequest } from '../types/index.js';

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
  category: { name: string; slug: string | null } | null;
  owner: { firstName: string; lastName: string } | null;
  createdAt: Date;
  updatedAt: Date;
  recommendationScore: number;
  reason: string;
}

const calculateScore = (listing: {
  averageRating: number;
  reviewCount: number;
  verified: string;
  pricing: unknown;
  features: string[];
}): number => {
  let score = 0;

  if (listing.averageRating >= 4) score += 30;
  else if (listing.averageRating >= 3) score += 15;

  if (listing.reviewCount > 50) score += 20;
  else if (listing.reviewCount > 10) score += 10;

  if (listing.verified === 'VERIFIED') score += 25;

  const pricing = listing.pricing as Record<string, unknown> | null;
  if (pricing?.minimum) {
    if (Number(pricing.minimum) <= 10000) score += 15;
    else if (Number(pricing.minimum) <= 50000) score += 10;
    else score += 5;
  }

  if (listing.features && listing.features.length > 5) score += 10;
  else if (listing.features && listing.features.length > 2) score += 5;

  return score;
};

const getReason = (listing: {
  averageRating: number;
  verified: string;
  reviewCount: number;
  pricing: unknown;
}): string => {
  const reasons: string[] = [];

  if (listing.averageRating >= 4) reasons.push('Highly rated');
  if (listing.verified === 'VERIFIED') reasons.push('Verified provider');
  if (listing.reviewCount > 50) reasons.push('Popular choice');

  const pricing = listing.pricing as Record<string, unknown> | null;
  if (pricing?.minimum && Number(pricing.minimum) <= 10000) reasons.push('Affordable pricing');

  return reasons.length > 0 ? reasons.join(', ') : 'Recommended match';
};

export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sector, limit = 10 } = req.query;
    const takeLimit = Number(limit);

    const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.APPROVED };
    if (sector) where.sector = String(sector) as Sector;

    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
    });

    const scored: ScoredListing[] = listings.map((listing) => {
      const score = calculateScore(listing);
      return {
        ...listing,
        recommendationScore: score,
        reason: getReason(listing),
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    const top = scored.slice(0, takeLimit);

    const currentUserId = req.userId;
    if (currentUserId) {
      const recommendations = top.map((l) => ({
        userId: currentUserId,
        listingId: l.id,
        reason: l.reason,
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

    const listings = await prisma.listing.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        owner: { select: { firstName: true, lastName: true } },
      },
      orderBy: { averageRating: 'desc' },
    });

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
      const reason =
        budget && pricing?.minimum && Number(pricing.minimum) <= Number(budget)
          ? `Within budget (${pricing.currency || 'NGN'} ${pricing.minimum})`
          : getReason(l);

      const score = calculateScore(l);
      return { ...l, recommendationScore: score, reason };
    });

    res.json(ApiResponse.success(result));
  } catch (error) {
    next(error);
  }
};
