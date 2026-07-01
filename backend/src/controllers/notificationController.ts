import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';

interface AuthRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: string;
}

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const total = await prisma.notification.count({ where: { userId: req.userId } });

    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.userId, read: false },
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(notifications, { ...pagination, unreadCount }));
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });

    res.json(ApiResponse.success(updated, 'Marked as read'));
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });

    res.json(ApiResponse.success(null, 'All notifications marked as read'));
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId, read: false },
    });

    res.json(ApiResponse.success({ count }));
  } catch (error) {
    next(error);
  }
};
