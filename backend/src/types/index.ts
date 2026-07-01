import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  avatar?: string;
  role: 'USER' | 'PROVIDER' | 'ADMIN';
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  providerProfile?: IProviderProfile;
  refreshToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
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

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
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

export interface IListing extends Document {
  _id: Types.ObjectId;
  title: string;
  slug?: string;
  description: string;
  category: Types.ObjectId | ICategory;
  owner: Types.ObjectId | IUser;
  sector: string;
  contact?: IContact;
  location?: ILocation;
  images: string[];
  features: string[];
  pricing?: IPricing;
  operatingHours?: IOperatingHours;
  averageRating: number;
  reviewCount: number;
  verified: 'UNVERIFIED' | 'VERIFIED' | 'PENDING';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  listing: Types.ObjectId | IListing;
  rating: number;
  review?: string;
  helpfulCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface IFavorite extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  listing: Types.ObjectId | IListing;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComparison extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  listings: Types.ObjectId[] | IListing[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRecommendation extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  listing: Types.ObjectId | IListing;
  reason?: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISearchHistory extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  keyword?: string;
  filters?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  title: string;
  message: string;
  read: boolean;
  type: 'LISTING' | 'REVIEW' | 'SYSTEM' | 'APPROVAL';
  reference?: Types.ObjectId;
  referenceModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
  userRole?: string;
  validatedBody?: Record<string, unknown>;
  validatedQuery?: Record<string, unknown>;
  validatedParams?: Record<string, unknown>;
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
