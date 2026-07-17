import { Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import type { AuthRequest } from '../types/index.js';

export const registerForEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId, firstName, lastName, email, phone } = req.body;

    if (!eventId || !firstName || !lastName || !email) {
      throw ApiError.badRequest('Missing required fields: eventId, firstName, lastName, email');
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw ApiError.notFound('Event not found');
    }
    if (event.status !== 'ACTIVE') {
      throw ApiError.badRequest('Event is not accepting registrations');
    }

    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_email: { eventId, email } },
    });
    if (existing) {
      throw ApiError.conflict('You have already registered for this event');
    }

    const registration = await prisma.eventRegistration.create({
      data: { eventId, firstName, lastName, email, phone: phone || null },
    });

    res.status(201).json(ApiResponse.created(registration, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

export const getEventRegistrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const event = await prisma.event.findUnique({ where: { id: req.params.eventId } });
    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        where: { eventId: req.params.eventId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eventRegistration.count({ where: { eventId: req.params.eventId } }),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(registrations, pagination));
  } catch (error) {
    next(error);
  }
};

export const getAllRegistrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const [registrations, total] = await Promise.all([
      prisma.eventRegistration.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { event: { select: { id: true, title: true, date: true } } },
      }),
      prisma.eventRegistration.count(),
    ]);

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(registrations, pagination));
  } catch (error) {
    next(error);
  }
};
