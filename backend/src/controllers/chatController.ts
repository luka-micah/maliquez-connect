import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import type { AuthRequest } from '../types/index.js';

export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId } = req.body;
    const userId = req.userId!;
    const userRole = req.userRole!;

    if (userRole === 'PROVIDER') {
      throw ApiError.forbidden('Providers cannot start conversations');
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw ApiError.notFound('Listing not found');
    if (listing.status !== 'APPROVED') throw ApiError.badRequest('Listing is not available');

    const existing = await prisma.conversation.findUnique({
      where: { userId_providerId_listingId: { userId, providerId: listing.ownerId, listingId } },
    });
    if (existing) {
      const messages = await prisma.message.findMany({
        where: { conversationId: existing.id },
        orderBy: { createdAt: 'asc' },
        take: 50,
        include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
      });
      return res.status(200).json(ApiResponse.success({ ...existing, messages }, 'Conversation already exists'));
    }

    const conversation = await prisma.conversation.create({
      data: { listingId, userId, providerId: listing.ownerId },
    });

    res.status(201).json(ApiResponse.created(conversation, 'Conversation created'));
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const userRole = req.userRole!;

    const where = userRole === 'PROVIDER' ? { providerId: userId } : { userId };

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      include: {
        listing: { select: { id: true, title: true, images: true } },
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        provider: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
        },
      },
    });

    const data = conversations.map((c) => {
      const unreadCount = 0;
      return { ...c, unreadCount };
    });

    res.json(ApiResponse.success(data));
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const userRole = req.userRole!;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        listing: { select: { id: true, title: true, images: true } },
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        provider: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    if (!conversation) throw ApiError.notFound('Conversation not found');

    if (conversation.userId !== userId && conversation.providerId !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    res.json(ApiResponse.success(conversation));
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) throw ApiError.notFound('Conversation not found');

    if (conversation.userId !== userId && conversation.providerId !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
    });

    res.json(ApiResponse.success(messages));
  } catch (error) {
    next(error);
  }
};

export const markConversationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const conversation = await prisma.conversation.findUnique({ where: { id } });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    if (conversation.userId !== userId && conversation.providerId !== userId) {
      throw ApiError.forbidden('Access denied');
    }

    await prisma.message.updateMany({
      where: { conversationId: id, senderId: { not: userId }, read: false },
      data: { read: true },
    });

    res.json(ApiResponse.success(null, 'Messages marked as read'));
  } catch (error) {
    next(error);
  }
};
