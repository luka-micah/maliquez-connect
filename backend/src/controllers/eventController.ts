import { Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import {
  uploadEventImageToCloudinary,
  deleteImageFromCloudinary,
  deleteEventFolder,
} from '../services/cloudinaryService.js';
import type { AuthRequest } from '../types/index.js';

export const getPublishedEvents = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const events = await prisma.event.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { date: 'asc' },
    });

    res.json(ApiResponse.success(events));
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.count(),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(events, pagination));
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    res.json(ApiResponse.success(event));
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || null,
        image: data.image || null,
        date: data.date ? new Date(data.date) : null,
        time: data.time || null,
        location: data.location || null,
        linkUrl: data.linkUrl || null,
        status: data.status || 'ACTIVE',
      },
    });

    if (req.file) {
      try {
        const uploaded = await uploadEventImageToCloudinary(req.file, event.id);
        await prisma.event.update({
          where: { id: event.id },
          data: { image: uploaded.url, imagePublicId: uploaded.publicId },
        });
      } catch (error) {
        await prisma.event.delete({ where: { id: event.id } });
        return next(error);
      }
    }

    const created = await prisma.event.findUnique({ where: { id: event.id } });

    res.status(201).json(ApiResponse.created(created, 'Event created'));
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      throw ApiError.notFound('Event not found');
    }

    const updateData: Prisma.EventUpdateInput = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.date !== undefined && { date: data.date ? new Date(data.date) : null }),
      ...(data.time !== undefined && { time: data.time }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
      ...(data.status !== undefined && { status: data.status }),
    };

    if (req.file) {
      const uploaded = await uploadEventImageToCloudinary(req.file, existing.id);
      updateData.image = uploaded.url;
      updateData.imagePublicId = uploaded.publicId;
    } else if (data.image !== undefined) {
      updateData.image = data.image;
      updateData.imagePublicId = null;
    } else if (data.removeImage === 'true' || data.removeImage === true) {
      updateData.image = null;
      updateData.imagePublicId = null;
      if (existing.imagePublicId) {
        await deleteImageFromCloudinary(existing.imagePublicId);
      }
    }

    const event = await prisma.event.update({
      where: { id: existing.id },
      data: updateData,
    });

    if (req.file && existing.imagePublicId) {
      await deleteImageFromCloudinary(existing.imagePublicId);
    }

    res.json(ApiResponse.success(event, 'Event updated'));
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(ApiError.notFound('Event not found'));
    }
    next(error);
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: { id: true, imagePublicId: true },
    });

    if (!existing) {
      throw ApiError.notFound('Event not found');
    }

    await prisma.event.delete({ where: { id: existing.id } });

    if (existing.imagePublicId) {
      await deleteImageFromCloudinary(existing.imagePublicId);
    } else {
      await deleteEventFolder(existing.id);
    }

    res.json(ApiResponse.success(null, 'Event deleted'));
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return next(ApiError.notFound('Event not found'));
    }
    next(error);
  }
};
