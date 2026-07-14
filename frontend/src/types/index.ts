export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'PROVIDER' | 'ADMIN';
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  providerProfile?: ProviderProfile;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
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

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  status: 'ACTIVE' | 'INACTIVE';
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

export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
}

export interface ImageMeta {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
}

export interface Listing {
  id: string;
  title: string;
  slug?: string;
  description: string;
  category: Category | string;
  owner: User | string;
  sector: string;
  contact?: Contact;
  location?: Location;
  images: string[];
  imageMetadata?: ImageMeta[];
  features: string[];
  pricing?: Pricing;
  operatingHours?: OperatingHours;
  averageRating: number;
  reviewCount: number;
  verified: 'UNVERIFIED' | 'VERIFIED' | 'PENDING';
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  recommendationScore?: number;
  reason?: string;
}

export interface Review {
  id: string;
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  listing: string;
  rating: number;
  review?: string;
  helpfulCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: string;
  user: string;
  listing: Listing;
  createdAt: string;
}

export interface Comparison {
  id: string;
  user: string;
  listings: Listing[];
  fields: ComparisonFields;
  createdAt: string;
}

export interface ComparisonFields {
  title: string[];
  sector: string[];
  category: string[];
  rating: number[];
  reviewCount: number[];
  location: string[];
  pricing: string[];
  features: string[][];
  verified: string[];
  images: string[];
}

export interface Recommendation {
  id: string;
  user: string;
  listing: string | Listing;
  reason?: string;
  score: number;
  createdAt: string;
}

export interface RecommendationListing extends Listing {
  recommendationScore?: number;
  matchReasons?: string[];
}

export interface SearchHistory {
  id: string;
  user: string;
  keyword?: string;
  filters?: Record<string, string>;
  createdAt: string;
}

export interface Notification {
  id: string;
  user: string;
  title: string;
  message: string;
  read: boolean;
  type: 'LISTING' | 'REVIEW' | 'SYSTEM' | 'APPROVAL';
  reference?: string;
  referenceModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  unreadCount?: number;
}

export interface AdminDashboard {
  totalUsers: number;
  totalProviders: number;
  totalListings: number;
  totalReviews: number;
  pendingListings: number;
  pendingReviews: number;
}

export interface ProviderAnalytics {
  totalListings: number;
  totalReviews: number;
  averageRating: number;
  listingsByStatus: {
    pending: number;
    approved: number;
    suspended: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'USER' | 'PROVIDER';
  providerProfile?: {
    businessName?: string;
    businessType?: string;
  };
  subscribedToNewsletter?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  userId: string;
  providerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  listing: { id: string; title: string; images: string[] };
  user: { id: string; firstName: string; lastName: string; avatar?: string };
  provider: { id: string; firstName: string; lastName: string; avatar?: string };
  messages?: Message[];
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  sender: { id: string; firstName: string; lastName: string; avatar?: string };
}
