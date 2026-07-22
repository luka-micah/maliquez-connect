import crypto from 'crypto';
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import { calculatePagination, parsePagination } from '../utils/helpers.js';
import { hashPassword } from '../utils/password.js';
import { sendInvitationEmail, sendWelcomeEmail } from '../services/emailService.js';
import type { AuthRequest } from '../types/index.js';

const generateReferralCode = async (): Promise<string> => {
  const lastAgent = await prisma.agentProfile.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { referralCode: true },
  });

  let nextNum = 1;
  if (lastAgent) {
    const match = lastAgent.referralCode.match(/MCAG-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `MCAG-${String(nextNum).padStart(4, '0')}`;
};

export const getOrCreateAgentProfile = async (userId: string): Promise<{ id: string }> => {
  const existing = await prisma.agentProfile.findUnique({ where: { userId } });
  if (existing) return existing;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');

  const referralCode = await generateReferralCode();

  return prisma.agentProfile.create({
    data: {
      userId,
      name: `${user.firstName} ${user.lastName}`,
      referralCode,
    },
  });
};

export const registerAgent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password, assignedState, assignedLGA } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw ApiError.badRequest('First name, last name, email, and password are required');
    }

    if (password.length < 6) {
      throw ApiError.badRequest('Password must be at least 6 characters');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const hashed = await hashPassword(password);
    const referralCode = await generateReferralCode();

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        password: hashed,
        role: 'AGENT',
        status: 'INACTIVE',
      },
    });

    const agentProfile = await prisma.agentProfile.create({
      data: {
        userId: user.id,
        name: `${firstName} ${lastName}`,
        referralCode,
        phone,
        assignedState,
        assignedLGA,
        status: 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'AGENT_REGISTRATION',
        entityType: 'AgentProfile',
        entityId: agentProfile.id,
        newValue: { email, firstName, lastName, referralCode },
      },
    });

    sendWelcomeEmail({ email: user.email, firstName: user.firstName }).catch(() => {});

    const { password: _, refreshToken: __, passwordResetToken: ___, passwordResetExpires: ____, ...safeUser } = user;

    res.status(201).json(ApiResponse.created({
      user: safeUser,
      message: 'Registration submitted. An administrator will review and activate your account. You will be able to log in once approved.',
    }));
  } catch (error) {
    next(error);
  }
};

export const getAgentProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let profile = await prisma.agentProfile.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
    });

    if (!profile) {
      profile = await getOrCreateAgentProfile(req.userId!) as any;
      profile = await prisma.agentProfile.findUnique({
        where: { userId: req.userId },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
      });
    }

    res.json(ApiResponse.success(profile));
  } catch (error) {
    next(error);
  }
};

export const updateAgentProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phone, assignedState, assignedLGA } = req.body;
    const profile = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!profile) throw ApiError.notFound('Agent profile not found');

    const updated = await prisma.agentProfile.update({
      where: { userId: req.userId },
      data: { phone, assignedState, assignedLGA },
    });

    res.json(ApiResponse.success(updated, 'Profile updated'));
  } catch (error) {
    next(error);
  }
};

export const getAgentDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const onboardings = await prisma.providerOnboarding.findMany({
      where: { agentId: agent.id },
    });

    const totalBusinessesContacted = onboardings.filter(o =>
      !['PROSPECT'].includes(o.onboardingStatus)
    ).length;
    const totalRegistered = onboardings.filter(o =>
      ['REGISTERED', 'INVITED', 'ACCOUNT_CLAIMED', 'PROFILE_COMPLETED', 'DOCUMENTS_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED'].includes(o.onboardingStatus)
    ).length;
    const totalInvitationsSent = onboardings.filter(o => o.invitedAt).length;
    const pendingClaims = onboardings.filter(o => o.onboardingStatus === 'INVITED').length;
    const pendingReviews = onboardings.filter(o => o.onboardingStatus === 'UNDER_REVIEW').length;
    const approvedProviders = onboardings.filter(o => ['APPROVED', 'PUBLISHED'].includes(o.onboardingStatus)).length;
    const rejectedProviders = onboardings.filter(o => o.onboardingStatus === 'REJECTED').length;

    const totalDecided = approvedProviders + rejectedProviders;
    const approvalRate = totalDecided > 0 ? Math.round((approvedProviders / totalDecided) * 100) : 0;

    const now = new Date();

    const monthlyCounts: Record<string, number> = {};
    const weeklyCounts: Record<string, number> = {};
    for (const o of onboardings) {
      const d = new Date(o.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;

      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      const weekKey = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth() + 1).padStart(2, '0')}-${String(startOfWeek.getDate()).padStart(2, '0')}`;
      weeklyCounts[weekKey] = (weeklyCounts[weekKey] || 0) + 1;
    }

    const monthlyRegistrations = Object.entries(monthlyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    const weeklyRegistrations = Object.entries(weeklyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week, count }));

    const activities = await prisma.outreachActivity.findMany({
      where: { agentId: agent.id },
      orderBy: { nextFollowUp: 'asc' },
    });

    const todaysFollowUps = activities.filter(a => {
      if (!a.nextFollowUp) return false;
      const d = new Date(a.nextFollowUp);
      return d.toDateString() === now.toDateString();
    });

    const upcomingFollowUps = activities.filter(a => {
      if (!a.nextFollowUp) return false;
      const d = new Date(a.nextFollowUp);
      return d > now && d.toDateString() !== now.toDateString();
    });

    const overdueFollowUps = activities.filter(a => {
      if (!a.nextFollowUp) return false;
      const d = new Date(a.nextFollowUp);
      return d < now && d.toDateString() !== now.toDateString();
    });

    res.json(ApiResponse.success({
      totalBusinessesContacted,
      totalRegistered,
      totalInvitationsSent,
      pendingClaims,
      pendingReviews,
      approvedProviders,
      rejectedProviders,
      monthlyRegistrations,
      weeklyRegistrations,
      approvalRate,
      todaysFollowUps,
      upcomingFollowUps,
      overdueFollowUps,
    }));
  } catch (error) {
    next(error);
  }
};

export const getAgentProviders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });
    const { status, state, lga, category, search } = req.query;

    const where: any = { agentId: agent.id };
    if (status) where.onboardingStatus = status as string;
    if (state) where.state = state as string;
    if (lga) where.lga = lga as string;
    if (category) where.category = category as string;
    if (search) {
      where.OR = [
        { businessName: { contains: search as string, mode: 'insensitive' } },
        { contactPerson: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.providerOnboarding.count({ where });
    const providers = await prisma.providerOnboarding.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
      include: {
        provider: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, status: true } },
        documents: { select: { id: true, documentType: true, status: true, createdAt: true } },
      },
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(providers, pagination));
  } catch (error) {
    next(error);
  }
};

export const getAgentProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const provider = await prisma.providerOnboarding.findFirst({
      where: { id: req.params.id, agentId: agent.id },
      include: {
        provider: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true, phone: true, status: true } },
        documents: true,
        outreachActivities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!provider) throw ApiError.notFound('Provider not found or not assigned to you');
    res.json(ApiResponse.success(provider));
  } catch (error) {
    next(error);
  }
};

export const createProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const {
      businessName, category, sector, contactPerson, phoneNumber,
      email, whatsappNumber, address, state, lga, description,
      gpsCoordinates, website, socialLinks,
    } = req.body;

    if (!businessName || !contactPerson || !phoneNumber || !email) {
      throw ApiError.badRequest('Business name, contact person, phone, and email are required');
    }

    const existingProvider = await prisma.providerOnboarding.findFirst({ where: { email } });
    if (existingProvider) {
      throw ApiError.conflict('A provider with this email already exists');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    let providerUserId: string;

    if (existingUser) {
      if (existingUser.role === 'PROVIDER' || existingUser.role === 'AGENT' || existingUser.role === 'ADMIN') {
        throw ApiError.conflict('This email is already registered as a provider or admin');
      }
      providerUserId = existingUser.id;
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'PROVIDER' },
      });
    } else {
      const tempPassword = crypto.randomBytes(16).toString('hex');
      const { hashPassword } = await import('../utils/password.js');
      const hashedPassword = await hashPassword(tempPassword);

      const newUser = await prisma.user.create({
        data: {
          firstName: contactPerson.split(' ')[0] || contactPerson,
          lastName: contactPerson.split(' ').slice(1).join(' ') || 'User',
          email,
          phone: phoneNumber,
          password: hashedPassword,
          role: 'PROVIDER',
          isVerified: false,
        },
      });
      providerUserId = newUser.id;
    }

    const onboarding = await prisma.providerOnboarding.create({
      data: {
        providerId: providerUserId,
        agentId: agent.id,
        businessName,
        category,
        sector,
        contactPerson,
        phoneNumber,
        email,
        whatsappNumber,
        address,
        state,
        lga,
        description,
        gpsCoordinates: gpsCoordinates ? JSON.parse(JSON.stringify(gpsCoordinates)) : undefined,
        website,
        socialLinks: socialLinks ? JSON.parse(JSON.stringify(socialLinks)) : undefined,
        onboardingStatus: 'REGISTERED',
      },
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        userId: req.userId,
        action: 'PROVIDER_REGISTRATION',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        newValue: { businessName, email, contactPerson },
      },
    });

    await prisma.notification.create({
      data: {
        userId: providerUserId,
        title: 'Business Registered',
        message: `Your business "${businessName}" has been registered on Maliquez Connect. Check your email for an invitation to claim your account.`,
        type: 'ONBOARDING',
        referenceId: onboarding.id,
        referenceModel: 'ProviderOnboarding',
      },
    });

    res.status(201).json(ApiResponse.created(onboarding, 'Provider registered successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProvider = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const existing = await prisma.providerOnboarding.findFirst({
      where: { id: req.params.id, agentId: agent.id },
    });
    if (!existing) throw ApiError.notFound('Provider not found or not assigned to you');

    if (['APPROVED', 'PUBLISHED', 'REJECTED', 'SUSPENDED', 'INACTIVE'].includes(existing.onboardingStatus)) {
      throw ApiError.badRequest('Cannot edit provider after final status');
    }

    const allowedFields = [
      'businessName', 'category', 'sector', 'contactPerson', 'phoneNumber',
      'whatsappNumber', 'address', 'state', 'lga', 'description',
      'gpsCoordinates', 'website', 'socialLinks', 'onboardingNotes',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'gpsCoordinates' || field === 'socialLinks') {
          updateData[field] = JSON.parse(JSON.stringify(req.body[field]));
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(ApiResponse.success(updated, 'Provider updated'));
  } catch (error) {
    next(error);
  }
};

export const updateProviderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const { status } = req.body;
    const validTransitions: Record<string, string[]> = {
      PROSPECT: ['CONTACTED'],
      CONTACTED: ['INTERESTED', 'PROSPECT'],
      INTERESTED: ['REGISTERED', 'CONTACTED'],
      REGISTERED: ['INVITED'],
      INVITED: ['ACCOUNT_CLAIMED'],
      ACCOUNT_CLAIMED: ['PROFILE_COMPLETED'],
      PROFILE_COMPLETED: ['DOCUMENTS_SUBMITTED'],
      DOCUMENTS_SUBMITTED: ['UNDER_REVIEW'],
      UNDER_REVIEW: ['APPROVED', 'REJECTED'],
      APPROVED: ['PUBLISHED'],
    };

    const onboarding = await prisma.providerOnboarding.findFirst({
      where: { id: req.params.id, agentId: agent.id },
    });
    if (!onboarding) throw ApiError.notFound('Provider not found');

    const allowed = validTransitions[onboarding.onboardingStatus];
    if (!allowed || !allowed.includes(status)) {
      throw ApiError.badRequest(`Cannot transition from ${onboarding.onboardingStatus} to ${status}`);
    }

    const prevStatus = onboarding.onboardingStatus;
    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: { onboardingStatus: status },
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        userId: req.userId,
        action: 'STATUS_CHANGE',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        previousValue: { onboardingStatus: prevStatus },
        newValue: { onboardingStatus: status },
      },
    });

    res.json(ApiResponse.success(updated, 'Status updated'));
  } catch (error) {
    next(error);
  }
};

export const sendInvitation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const onboarding = await prisma.providerOnboarding.findFirst({
      where: { id: req.params.id, agentId: agent.id },
    });
    if (!onboarding) throw ApiError.notFound('Provider not found');

    if (onboarding.onboardingStatus !== 'REGISTERED') {
      throw ApiError.badRequest('Provider must be in REGISTERED status to send invitation');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.invitationToken.create({
      data: {
        email: onboarding.email,
        token,
        providerId: onboarding.id,
        expiresAt,
      },
    });

    const invitationLink = `${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173'}/provider/claim?token=${token}`;
    const expirationDate = expiresAt.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    await sendInvitationEmail({
      email: onboarding.email,
      providerName: onboarding.contactPerson,
      businessName: onboarding.businessName,
      invitationLink,
      expirationDate,
    });

    const updated = await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: {
        onboardingStatus: 'INVITED',
        invitedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        userId: req.userId,
        action: 'INVITATION',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        newValue: { invitedAt: new Date(), token },
      },
    });

    await prisma.notification.create({
      data: {
        userId: onboarding.providerId,
        title: 'Invitation Sent',
        message: `You've been invited to join Maliquez Connect for "${onboarding.businessName}". Check your email for details.`,
        type: 'ONBOARDING',
        referenceId: onboarding.id,
        referenceModel: 'ProviderOnboarding',
      },
    });

    res.json(ApiResponse.success(updated, 'Invitation sent successfully'));
  } catch (error) {
    next(error);
  }
};

export const resendInvitation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const onboarding = await prisma.providerOnboarding.findFirst({
      where: { id: req.params.id, agentId: agent.id },
    });
    if (!onboarding) throw ApiError.notFound('Provider not found');

    if (!['INVITED', 'REGISTERED'].includes(onboarding.onboardingStatus)) {
      throw ApiError.badRequest('Cannot resend invitation at this stage');
    }

    const oldTokens = await prisma.invitationToken.findMany({
      where: { email: onboarding.email, usedAt: null },
    });
    for (const ot of oldTokens) {
      await prisma.invitationToken.update({
        where: { id: ot.id },
        data: { usedAt: new Date(0) },
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.invitationToken.create({
      data: {
        email: onboarding.email,
        token,
        providerId: onboarding.id,
        expiresAt,
      },
    });

    const invitationLink = `${process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173'}/provider/claim?token=${token}`;
    const expirationDate = expiresAt.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    await sendInvitationEmail({
      email: onboarding.email,
      providerName: onboarding.contactPerson,
      businessName: onboarding.businessName,
      invitationLink,
      expirationDate,
    });

    await prisma.providerOnboarding.update({
      where: { id: req.params.id },
      data: { invitedAt: new Date(), onboardingStatus: 'INVITED' },
    });

    await prisma.auditLog.create({
      data: {
        agentId: agent.id,
        userId: req.userId,
        action: 'INVITATION',
        entityType: 'ProviderOnboarding',
        entityId: onboarding.id,
        newValue: { invitedAt: new Date(), token },
      },
    });

    await prisma.notification.create({
      data: {
        userId: onboarding.providerId,
        title: 'Invitation Resent',
        message: `A new invitation has been sent for "${onboarding.businessName}". Check your email.`,
        type: 'ONBOARDING',
        referenceId: onboarding.id,
        referenceModel: 'ProviderOnboarding',
      },
    });

    res.json(ApiResponse.success(null, 'Invitation resent'));
  } catch (error) {
    next(error);
  }
};

export const createFollowUp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const { providerId, activityType, note, nextFollowUp } = req.body;

    const onboarding = await prisma.providerOnboarding.findFirst({
      where: { id: providerId, agentId: agent.id },
    });
    if (!onboarding) throw ApiError.notFound('Provider not found');

    const activity = await prisma.outreachActivity.create({
      data: {
        agentId: agent.id,
        providerId: onboarding.id,
        onboardingId: onboarding.id,
        activityType: activityType || 'OTHER',
        note,
        nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      },
    });

    res.status(201).json(ApiResponse.created(activity, 'Follow-up created'));
  } catch (error) {
    next(error);
  }
};

export const getActivities = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const { page, limit, skip } = parsePagination(req.query as { page?: string; limit?: string });

    const where: any = { agentId: agent.id };
    if (req.query.providerId) where.providerId = req.query.providerId as string;
    if (req.query.activityType) where.activityType = req.query.activityType as string;

    const total = await prisma.outreachActivity.count({ where });
    const activities = await prisma.outreachActivity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        onboarding: { select: { id: true, businessName: true, contactPerson: true } },
      },
    });

    const pagination = calculatePagination(page, limit, total);
    res.json(ApiResponse.paginated(activities, pagination));
  } catch (error) {
    next(error);
  }
};

export const getFollowUps = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const agent = await prisma.agentProfile.findUnique({ where: { userId: req.userId } });
    if (!agent) throw ApiError.notFound('Agent profile not found');

    const now = new Date();
    const activities = await prisma.outreachActivity.findMany({
      where: {
        agentId: agent.id,
        nextFollowUp: { not: null },
      },
      orderBy: { nextFollowUp: 'asc' },
      include: {
        onboarding: { select: { id: true, businessName: true, contactPerson: true, onboardingStatus: true } },
      },
    });

    const todaysFollowUps = activities.filter(a => {
      if (!a.nextFollowUp) return false;
      const d = new Date(a.nextFollowUp);
      return d.toDateString() === now.toDateString();
    });

    const upcomingFollowUps = activities.filter(a => {
      if (!a.nextFollowUp) return false;
      const d = new Date(a.nextFollowUp);
      return d > now && d.toDateString() !== now.toDateString();
    });

    const overdueFollowUps = activities.filter(a => {
      if (!a.nextFollowUp) return false;
      const d = new Date(a.nextFollowUp);
      return d < now && d.toDateString() !== now.toDateString();
    });

    res.json(ApiResponse.success({
      todaysFollowUps,
      upcomingFollowUps,
      overdueFollowUps,
    }));
  } catch (error) {
    next(error);
  }
};
