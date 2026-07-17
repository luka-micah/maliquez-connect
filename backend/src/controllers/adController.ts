import { Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { invalidateCache } from '../config/redis.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import type { AuthRequest } from '../types/index.js';

export const getActiveAds = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: {
        status: 'ACTIVE',
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ApiResponse.success(ads));
  } catch (error) {
    next(error);
  }
};

export const getAllAds = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.ad.count(),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(ads, pagination));
  } catch (error) {
    next(error);
  }
};

export const getAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const ad = await prisma.ad.findUnique({ where: { id: req.params.id } });

    if (!ad) {
      throw ApiError.notFound('Ad not found');
    }

    res.json(ApiResponse.success(ad));
  } catch (error) {
    next(error);
  }
};

export const createAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const ad = await prisma.ad.create({
      data: {
        title: data.title,
        image: data.image,
        linkUrl: data.linkUrl || null,
        status: data.status || 'ACTIVE',
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    await invalidateCache('ads:*');

    res.status(201).json(ApiResponse.created(ad, 'Ad created'));
  } catch (error) {
    next(error);
  }
};

export const updateAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const ad = await prisma.ad.update({
      where: { id: req.params.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      },
    });

    await invalidateCache('ads:*');

    res.json(ApiResponse.success(ad, 'Ad updated'));
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(ApiError.notFound('Ad not found'));
    }
    next(error);
  }
};

export const deleteAd = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.ad.delete({ where: { id: req.params.id } });

    await invalidateCache('ads:*');

    res.json(ApiResponse.success(null, 'Ad deleted'));
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(ApiError.notFound('Ad not found'));
    }
    next(error);
  }
};
