import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  validatedBody?: Record<string, unknown>;
  validatedQuery?: Record<string, unknown>;
  validatedParams?: Record<string, unknown>;
}

export interface IProviderProfile {
  businessName?: string;
  businessType?: string;
  website?: string;
  description?: string;
  address?: string;
  state?: string;
  city?: string;
  logo?: string;
  verificationStatus: 'UNVERIFIED' | 'VERIFIED' | 'PENDING';
}

export interface ILocation {
  address?: string;
  state?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface IContact {
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
}

export interface IPricing {
  minimum?: number;
  maximum?: number;
  currency?: string;
}

export interface IOperatingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
}

export interface SearchQuery extends PaginationQuery {
  q?: string;
  sector?: string;
  category?: string;
  state?: string;
  city?: string;
  minRating?: string;
  maxPrice?: string;
  minPrice?: string;
  features?: string;
}

export interface ListingFilterQuery extends PaginationQuery {
  sector?: string;
  category?: string;
  state?: string;
  city?: string;
  minRating?: string;
  maxPrice?: string;
  minPrice?: string;
  status?: string;
}

export interface AdminUserQuery extends PaginationQuery {
  role?: string;
  status?: string;
  search?: string;
  verificationStatus?: string;
}

export interface IAgentProfile {
  id: string;
  userId: string;
  name: string;
  referralCode: string;
  phone?: string;
  assignedState?: string;
  assignedLGA?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface IProviderOnboarding {
  id: string;
  providerId: string;
  agentId: string;
  businessName: string;
  category?: string;
  sector?: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
  whatsappNumber?: string;
  address?: string;
  state?: string;
  lga?: string;
  description?: string;
  gpsCoordinates?: { lat: number; lng: number };
  website?: string;
  socialLinks?: Record<string, string>;
  onboardingStatus: string;
  onboardingNotes?: string;
  invitedAt?: string;
  claimedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOutreachActivity {
  id: string;
  agentId: string;
  providerId: string;
  onboardingId?: string;
  activityType: string;
  note?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProviderDocument {
  id: string;
  providerId: string;
  onboardingId: string;
  documentType: string;
  fileUrl: string;
  publicId?: string;
  fileName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAuditLog {
  id: string;
  userId?: string;
  agentId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  ipAddress?: string;
  createdAt: string;
}

export interface IAgentDashboard {
  totalBusinessesContacted: number;
  totalRegistered: number;
  totalInvitationsSent: number;
  pendingClaims: number;
  pendingReviews: number;
  approvedProviders: number;
  rejectedProviders: number;
  monthlyRegistrations: { month: string; count: number }[];
  weeklyRegistrations: { week: string; count: number }[];
  approvalRate: number;
  todaysFollowUps: IOutreachActivity[];
  upcomingFollowUps: IOutreachActivity[];
  overdueFollowUps: IOutreachActivity[];
}

export interface IAdminReport {
  totalProviders: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  invited: number;
  claimed: number;
  completionRate: number;
  averageApprovalTime: number;
  averageOnboardingTime: number;
  agentRankings: { agentId: string; name: string; totalRegistered: number; approvedCount: number }[];
  statePerformance: { state: string; count: number }[];
  lgaPerformance: { lga: string; count: number }[];
  monthlyGrowth: { month: string; count: number }[];
}
