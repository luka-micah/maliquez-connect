import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { hashPassword } from '../utils/password.js';
import type { AuthRequest } from '../types/index.js';

export const claimAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, password, firstName, lastName } = req.body;

    if (!token || !password || !firstName || !lastName) {
      throw ApiError.badRequest('Token, password, first name, and last name are required');
    }

    if (password.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters');
    }

    const invitation = await prisma.invitationToken.findUnique({
      where: { token },
      include: {
        provider: { include: { provider: true } },
      },
    });

    if (!invitation) {
      throw ApiError.notFound('Invalid invitation token');
    }

    if (invitation.usedAt) {
      throw ApiError.badRequest('This invitation has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw ApiError.badRequest('This invitation has expired. Please request a new one');
    }

    const hashedPassword = await hashPassword(password);

    const [user] = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: invitation.provider.providerId },
        data: {
          firstName,
          lastName,
          password: hashedPassword,
          isVerified: true,
          providerProfile: {
            businessName: invitation.provider.businessName,
            description: invitation.provider.description,
            address: invitation.provider.address,
            state: invitation.provider.state,
            website: invitation.provider.website,
            verificationStatus: 'UNVERIFIED',
          },
        },
      });

      await tx.invitationToken.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
      });

      await tx.providerOnboarding.update({
        where: { id: invitation.provider.id },
        data: {
          onboardingStatus: 'ACCOUNT_CLAIMED',
          claimedAt: new Date(),
        },
      });

      await tx.notification.create({
        data: {
          userId: u.id,
          title: 'Account Claimed',
          message: `Your account for "${invitation.provider.businessName}" has been claimed successfully. Please complete your profile.`,
          type: 'ONBOARDING',
          referenceId: invitation.provider.id,
          referenceModel: 'ProviderOnboarding',
        },
      });

      const agentNotif = await tx.agentProfile.findUnique({
        where: { id: invitation.provider.agentId },
      });
      if (agentNotif) {
        await tx.notification.create({
          data: {
            userId: agentNotif.userId,
            title: 'Provider Claimed Account',
            message: `"${invitation.provider.contactPerson}" has claimed their account for "${invitation.provider.businessName}".`,
            type: 'ONBOARDING',
            referenceId: invitation.provider.id,
            referenceModel: 'ProviderOnboarding',
          },
        });
      }

      return [u];
    });

    const { password: _, refreshToken: __, passwordResetToken: ___, passwordResetExpires: ____, ...safeUser } = user;
    res.json(ApiResponse.success(safeUser, 'Account claimed successfully. Please complete your profile.'));
  } catch (error) {
    next(error);
  }
};

export const completeProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const onboarding = await prisma.providerOnboarding.findUnique({ where: { providerId: userId } });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    if (!['ACCOUNT_CLAIMED', 'PROFILE_COMPLETED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW'].includes(onboarding.onboardingStatus)) {
      throw ApiError.badRequest('Cannot update profile at this stage');
    }

    const {
      businessName, category, sector, description,
      phoneNumber, whatsappNumber, address, state, lga,
      gpsCoordinates, website, socialLinks,
    } = req.body;

    const updateData: any = {};
    if (businessName) updateData.businessName = businessName;
    if (category) updateData.category = category;
    if (sector) updateData.sector = sector;
    if (description) updateData.description = description;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (whatsappNumber) updateData.whatsappNumber = whatsappNumber;
    if (address) updateData.address = address;
    if (state) updateData.state = state;
    if (lga) updateData.lga = lga;
    if (gpsCoordinates) updateData.gpsCoordinates = JSON.parse(JSON.stringify(gpsCoordinates));
    if (website) updateData.website = website;
    if (socialLinks) updateData.socialLinks = JSON.parse(JSON.stringify(socialLinks));

    const currentStatus = onboarding.onboardingStatus;
    if (currentStatus === 'ACCOUNT_CLAIMED') {
      updateData.onboardingStatus = 'PROFILE_COMPLETED';
    }

    const [updated] = await prisma.$transaction(async (tx) => {
      const p = await tx.providerOnboarding.update({
        where: { providerId: userId },
        data: updateData,
      });

      if (currentStatus === 'ACCOUNT_CLAIMED') {
        const agentProfile = await tx.agentProfile.findUnique({ where: { id: onboarding.agentId } });
        if (agentProfile) {
          await tx.notification.create({
            data: {
              userId: agentProfile.userId,
              title: 'Provider Completed Profile',
              message: `"${onboarding.contactPerson}" has completed their profile for "${onboarding.businessName}".`,
              type: 'ONBOARDING',
              referenceId: onboarding.id,
              referenceModel: 'ProviderOnboarding',
            },
          });
        }
      }

      const currentUser = await tx.user.findUnique({ where: { id: userId } });
      const currentProfile = (currentUser?.providerProfile as Record<string, unknown>) || {};
      await tx.user.update({
        where: { id: userId },
        data: {
          providerProfile: {
            ...currentProfile,
            businessName: p.businessName,
            description: p.description,
            address: p.address,
            state: p.state,
            website: p.website,
            phone: p.phoneNumber,
          } as any,
        },
      });

      return [p];
    });

    res.json(ApiResponse.success(updated, 'Profile completed'));
  } catch (error) {
    next(error);
  }
};

export const uploadDocuments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const onboarding = await prisma.providerOnboarding.findUnique({ where: { providerId: userId } });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    if (!['PROFILE_COMPLETED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW'].includes(onboarding.onboardingStatus)) {
      throw ApiError.badRequest('Cannot upload documents at this stage. Complete your profile first.');
    }

    const { documentType, fileUrl, publicId, fileName } = req.body;

    if (!documentType || !fileUrl) {
      throw ApiError.badRequest('Document type and file URL are required');
    }

    const [doc] = await prisma.$transaction(async (tx) => {
      const d = await tx.providerDocument.create({
        data: {
          providerId: userId,
          onboardingId: onboarding.id,
          documentType,
          fileUrl,
          publicId,
          fileName,
          status: 'SUBMITTED',
        },
      });

      if (onboarding.onboardingStatus === 'PROFILE_COMPLETED') {
        await tx.providerOnboarding.update({
          where: { providerId: userId },
          data: { onboardingStatus: 'DOCUMENTS_SUBMITTED' },
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: 'DOCUMENT_UPLOAD',
          entityType: 'ProviderDocument',
          entityId: d.id,
          newValue: { documentType, fileName },
        },
      });

      const agentProfile = await tx.agentProfile.findUnique({ where: { id: onboarding.agentId } });
      if (agentProfile) {
        await tx.notification.create({
          data: {
            userId: agentProfile.userId,
            title: 'Provider Uploaded Documents',
            message: `"${onboarding.contactPerson}" has uploaded documents for "${onboarding.businessName}".`,
            type: 'ONBOARDING',
            referenceId: onboarding.id,
            referenceModel: 'ProviderOnboarding',
          },
        });
      }

      return [d];
    });

    res.status(201).json(ApiResponse.created(doc, 'Document uploaded'));
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId;
    const onboarding = await prisma.providerOnboarding.findUnique({
      where: { providerId: userId },
      include: {
        documents: true,
        agent: {
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
        },
      },
    });
    if (!onboarding) throw ApiError.notFound('Provider onboarding not found');

    res.json(ApiResponse.success(onboarding));
  } catch (error) {
    next(error);
  }
};
