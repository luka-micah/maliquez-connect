import { Prisma, Sector, ListingStatus } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { LISTING_STATUS } from '../constants/listingStatus.js';
import { calculatePagination, parsePagination, slugify } from '../utils/helpers.js';
import { ROLES } from '../constants/roles.js';
import { invalidateCache } from '../config/redis.js';
import { sendListingCreatedEmail } from '../services/emailService.js';
import type { AuthRequest } from '../types/index.js';
import type { Response, NextFunction } from 'express';

const parseSort = (sort: string): Record<string, 'asc' | 'desc'> => {
  const order = sort.startsWith('-') ? 'desc' : 'asc';
  const field = sort.replace(/^-/, '');
  return { [field]: order };
};

const sanitizeData = (body: Record<string, unknown>): Record<string, unknown> => {
  const data = { ...body };
  const immutable = ['id', 'ownerId', 'createdAt', 'updatedAt', 'averageRating', 'reviewCount'];
  for (const key of immutable) {
    delete data[key];
  }
  return data;
};

export const getListings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const {
      sector,
      category,
      state,
      city,
      minRating,
      maxPrice,
      minPrice,
      sort = '-createdAt',
    } = req.query as Record<string, string>;

    const where: Prisma.ListingWhereInput = { status: LISTING_STATUS.APPROVED };

    if (sector) where.sector = String(sector) as Sector;
    if (category) where.categoryId = category;
    if (minRating) where.averageRating = { gte: Number(minRating) };

    let listings = await prisma.listing.findMany({
      where,
      include: {
        category: { select: { name: true, slug: true } },
        owner: { select: { firstName: true, lastName: true, email: true, avatar: true } },
      },
      orderBy: parseSort(sort),
    });

    if (state) {
      listings = listings.filter((l) => {
        const loc = l.location as Record<string, unknown> | null;
        return loc?.state === state;
      });
    }

    if (city) {
      listings = listings.filter((l) => {
        const loc = l.location as Record<string, unknown> | null;
        return loc?.city === city;
      });
    }

    if (minPrice) {
      listings = listings.filter((l) => {
        const p = l.pricing as Record<string, unknown> | null;
        return p?.minimum !== undefined && Number(p.minimum) >= Number(minPrice);
      });
    }

    if (maxPrice) {
      listings = listings.filter((l) => {
        const p = l.pricing as Record<string, unknown> | null;
        return p?.minimum !== undefined && Number(p.minimum) <= Number(maxPrice);
      });
    }

    const total = listings.length;
    const paginatedListings = listings.slice(skip, skip + limit);
    const pagination = calculatePagination(page, limit, total);

    res.json(ApiResponse.paginated(paginatedListings, pagination));
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findFirst({
      where: {
        OR: [
          { id: req.params.id },
          { slug: req.params.id },
        ],
      },
      include: {
        category: { select: { name: true, slug: true } },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            providerProfile: true,
          },
        },
      },
    });

    if (!listing || listing.status !== LISTING_STATUS.APPROVED) {
      throw ApiError.notFound('Listing not found');
    }

    res.json(ApiResponse.success(listing));
  } catch (error) {
    next(error);
  }
};

export const createListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = sanitizeData(req.body);
    data.owner = { connect: { id: req.userId } };

    if (data.category) {
      data.category = { connect: { name: data.category as string } };
    }

    for (const key of ['contact', 'location', 'pricing', 'features', 'operatingHours'] as const) {
      if (typeof data[key] === 'string') {
        try {
          data[key] = JSON.parse(data[key] as string);
        } catch {
          if (key === 'features') {
            data[key] = (data[key] as string).split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }
    }

    if (typeof data.images === 'string') {
      try {
        data.images = JSON.parse(data.images as string);
      } catch {
        data.images = (data.images as string).split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    if (!data.slug && data.title) {
      data.slug = slugify(data.title as string);
    }

    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      const currentImages = data.images as string[] | undefined;
      if (!Array.isArray(currentImages)) {
        (data.images as string[]) = [];
      }
      (data.images as string[]).push(...(req.files as Express.Multer.File[]).map((f) => f.path));
    }

    const listing = await prisma.listing.create({ data: data as any });
    await invalidateCache('listings:*');

    prisma.user.findUnique({ where: { id: req.userId }, select: { email: true, firstName: true } }).then(owner => {
      if (owner) {
        sendListingCreatedEmail({
          email: owner.email,
          firstName: owner.firstName,
          listingTitle: listing.title,
        });
      }
    }).catch(() => {});

    res.status(201).json(ApiResponse.created(listing, 'Listing created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!existing) {
      throw ApiError.notFound('Listing not found');
    }

    if (existing.ownerId !== req.userId && req.userRole !== ROLES.ADMIN) {
      throw ApiError.forbidden('You can only edit your own listings');
    }

    const data = sanitizeData(req.body);

    if (data.category) {
      data.category = { connect: { name: data.category as string } };
    }

    for (const key of ['contact', 'location', 'pricing', 'features', 'operatingHours'] as const) {
      if (typeof data[key] === 'string') {
        try {
          data[key] = JSON.parse(data[key] as string);
        } catch {
          if (key === 'features') {
            data[key] = (data[key] as string).split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }
    }

    if (typeof data.images === 'string') {
      try {
        data.images = JSON.parse(data.images as string);
      } catch {
        data.images = (data.images as string).split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }

    const files = req.files as Express.Multer.File[] | undefined;
    if (files && files.length > 0) {
      const existingImages = Array.isArray(existing.images) ? existing.images : [];
      const newImages = Array.isArray(data.images) ? (data.images as string[]) : [];
      (data as Record<string, unknown>).images = [
        ...existingImages,
        ...newImages,
        ...files.map((f) => f.path),
      ];
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: data as any,
    });

    await invalidateCache('listings:*');

    res.json(ApiResponse.success(updated, 'Listing updated'));
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing) {
      throw ApiError.notFound('Listing not found');
    }

    if (listing.ownerId !== req.userId && req.userRole !== ROLES.ADMIN) {
      throw ApiError.forbidden('You can only delete your own listings');
    }

    await prisma.listing.delete({ where: { id: req.params.id } });
    await invalidateCache('listings:*');

    res.json(ApiResponse.success(null, 'Listing deleted'));
  } catch (error) {
    next(error);
  }
};

export const getMyListings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { status } = req.query as Record<string, string>;

    const where: Prisma.ListingWhereInput = { ownerId: req.userId };
    if (status) where.status = status as ListingStatus;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.listing.count({ where }),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(listings, pagination));
  } catch (error) {
    next(error);
  }
};
