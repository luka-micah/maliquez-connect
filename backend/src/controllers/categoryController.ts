import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { getCachedData, cacheData, invalidateCache } from '../config/redis.js';
import { slugify } from '../utils/helpers.js';
import type { AuthRequest } from '../types/index.js';

export const getCategories = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cached = await getCachedData('categories:all');
    if (cached) {
      return res.json(ApiResponse.success(cached));
    }

    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    await cacheData('categories:all', categories, 3600);

    res.json(ApiResponse.success(categories));
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
    });

    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    res.json(ApiResponse.success(category));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    if (!data.slug && data.name) {
      data.slug = slugify(data.name);
    }

    const category = await prisma.category.create({ data });

    await invalidateCache('categories:*');

    res.status(201).json(ApiResponse.created(category, 'Category created'));
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });

    await invalidateCache('categories:*');

    res.json(ApiResponse.success(category, 'Category updated'));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return next(ApiError.notFound('Category not found'));
    }
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id },
    });

    await invalidateCache('categories:*');

    res.json(ApiResponse.success(null, 'Category deleted'));
  } catch (error: any) {
    if (error.code === 'P2025') {
      return next(ApiError.notFound('Category not found'));
    }
    next(error);
  }
};
