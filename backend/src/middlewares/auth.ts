import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';
import prisma from '../config/prisma.js';
import { ROLE_HIERARCHY } from '../constants/roles.js';
import type { AuthRequest } from '../types/index.js';

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token) as { id: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.status !== 'ACTIVE') {
      throw ApiError.unauthorized('User not found or inactive');
    }

    req.user = user as any;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired token'));
    }
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!roles.includes(req.userRole!)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};

export const authorizeMinRole = (minRole: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (ROLE_HIERARCHY[req.userRole!] < ROLE_HIERARCHY[minRole]) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};
