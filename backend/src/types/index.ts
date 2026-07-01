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
