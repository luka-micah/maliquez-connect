import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { ROLES } from '../constants/roles.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import type { AuthRequest } from '../types/index.js';

const generateTokens = (userId: string, role: string) => ({
  accessToken: generateAccessToken(userId, role),
  refreshToken: generateRefreshToken(userId, role),
});

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, phone, password, role, providerProfile } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const userRole = role || ROLES.USER;
    const hashedPassword = await hashPassword(password);

    const userData: Record<string, unknown> = {
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: userRole,
    };

    if (userRole === ROLES.PROVIDER && providerProfile) {
      userData.providerProfile = {
        businessName: providerProfile.businessName,
        businessType: providerProfile.businessType,
      };
    }

    const user = await prisma.user.create({ data: userData as Prisma.UserCreateInput });
    const tokens = generateTokens(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    sendWelcomeEmail({ email: user.email, firstName: user.firstName }).catch(() => {});

    const { password: _, refreshToken: __, passwordResetToken: ___, passwordResetExpires: ____, ...safeUser } = user;

    res.status(201).json(ApiResponse.created({
      user: safeUser,
      ...tokens,
    }, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw ApiError.forbidden('Your account has been suspended');
    }

    const tokens = generateTokens(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    const { password: _, refreshToken: __, passwordResetToken: ___, passwordResetExpires: ____, ...safeUser } = user;

    res.json(ApiResponse.success({
      user: safeUser,
      ...tokens,
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: { refreshToken: null },
    });

    res.json(ApiResponse.success(null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      throw ApiError.badRequest('Refresh token is required');
    }

    const decoded = verifyRefreshToken(token) as { id: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = generateTokens(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    res.json(ApiResponse.success(tokens, 'Token refreshed'));
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Invalid or expired refresh token'));
    }
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const { password: _, refreshToken: __, passwordResetToken: ___, passwordResetExpires: ____, ...safeUser } = user;

    res.json(ApiResponse.success(safeUser));
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updates = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updateData: Record<string, unknown> = {};

    if (updates.firstName) updateData.firstName = updates.firstName;
    if (updates.lastName) updateData.lastName = updates.lastName;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.avatar) updateData.avatar = updates.avatar;

    if (updates.providerProfile && user.role === ROLES.PROVIDER) {
      const currentProfile = user.providerProfile as Record<string, unknown> | null;
      updateData.providerProfile = {
        ...(currentProfile as Record<string, unknown>),
        ...updates.providerProfile,
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData as Prisma.UserUpdateInput,
    });

    const { password: _, refreshToken: __, passwordResetToken: ___, passwordResetExpires: ____, ...safeUser } = updatedUser;

    res.json(ApiResponse.success(safeUser, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      throw ApiError.badRequest('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw ApiError.badRequest('Invalid email address');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw ApiError.notFound('No account found with this email address');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail({
      email: user.email,
      firstName: user.firstName,
      resetToken,
    });

    res.json(ApiResponse.success(null, 'Password reset link sent to your email'));
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string') {
      throw ApiError.badRequest('Reset token is required');
    }

    if (!password || typeof password !== 'string') {
      throw ApiError.badRequest('Password is required');
    }

    if (password.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null,
      },
    });

    res.json(ApiResponse.success(null, 'Password reset successful'));
  } catch (error) {
    next(error);
  }
};
