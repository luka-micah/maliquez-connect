export type Role = 'USER' | 'PROVIDER' | 'ADMIN' | 'SUPER_ADMIN' | 'AGENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type ListingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'PENDING';
export type Sector = 'EDUCATION' | 'HEALTHCARE' | 'HOSPITALITY' | 'LOGISTICS';

export interface ProviderProfile {
  businessName?: string;
  businessType?: string;
  website?: string;
  description?: string;
  address?: string;
  state?: string;
  city?: string;
  logo?: string;
  verificationStatus?: VerificationStatus;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
  isVerified: boolean;
  status: UserStatus;
  providerProfile?: ProviderProfile | null;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  address?: string;
  state?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
}

export interface Pricing {
  minimum?: number;
  maximum?: number;
  currency?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
}

export interface Listing {
  id: string;
  title: string;
  slug?: string;
  description: string;
  categoryId: string;
  category?: { id: string; name: string; slug?: string };
  ownerId?: string;
  sector: Sector;
  contact?: Contact | null;
  location?: Location | null;
  images?: string[];
  features?: string[];
  pricing?: Pricing | null;
  operatingHours?: Record<string, unknown> | null;
  averageRating: number;
  reviewCount: number;
  verified: VerificationStatus;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewUser {
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

export interface Review {
  id: string;
  userId: string;
  listingId: string;
  rating: number;
  review?: string | null;
  helpfulCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiPaginated<T> {
  success: true;
  data: T[];
  pagination: Pagination;
  message: string;
}
