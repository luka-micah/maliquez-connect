export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'PROVIDER' | 'AGENT' | 'ADMIN';
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  providerProfile?: ProviderProfile;
  agentProfile?: AgentProfile;
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

export interface EventRegistration {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  event?: { id: string; title: string; date?: string };
}

export interface AppEvent {
  id: string;
  title: string;
  description?: string;
  image?: string;
  date?: string;
  time?: string;
  location?: string;
  linkUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  id: string;
  title: string;
  image: string;
  linkUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
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

export interface AgentProfile {
  id: string;
  userId: string;
  name: string;
  referralCode: string;
  phone?: string;
  assignedState?: string;
  assignedLGA?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
  updatedAt: string;
  user?: { id: string; firstName: string; lastName: string; email: string; avatar?: string; status?: string; createdAt?: string };
  _count?: { providerOnboardings: number };
}

export interface ProviderOnboarding {
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
  onboardingStatus: OnboardingStatusType;
  onboardingNotes?: string;
  invitedAt?: string;
  claimedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  createdAt: string;
  updatedAt: string;
  provider?: { id: string; firstName: string; lastName: string; email: string; avatar?: string; phone?: string; status?: string };
  agent?: AgentProfile;
  documents?: ProviderDocument[];
  outreachActivities?: OutreachActivity[];
}

export type OnboardingStatusType =
  | 'PROSPECT' | 'CONTACTED' | 'INTERESTED' | 'REGISTERED'
  | 'INVITED' | 'ACCOUNT_CLAIMED' | 'PROFILE_COMPLETED'
  | 'DOCUMENTS_SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED'
  | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'INACTIVE';

export interface ProviderDocument {
  id: string;
  providerId: string;
  onboardingId: string;
  documentType: DocumentType;
  fileUrl: string;
  publicId?: string;
  fileName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'CAC_CERTIFICATE' | 'NATIONAL_ID' | 'DRIVER_LICENSE'
  | 'UTILITY_BILL' | 'BUSINESS_REGISTRATION' | 'TAX_CERTIFICATE'
  | 'OTHER';

export interface OutreachActivity {
  id: string;
  agentId: string;
  providerId: string;
  onboardingId?: string;
  activityType: ActivityType;
  note?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
  onboarding?: { id: string; businessName: string; contactPerson: string; onboardingStatus?: string };
}

export type ActivityType =
  | 'PHONE_CALL' | 'WHATSAPP' | 'SMS' | 'EMAIL'
  | 'OFFICE_VISIT' | 'MEETING' | 'FOLLOW_UP' | 'OTHER';

export interface AuditLogEntry {
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
  user?: { id: string; firstName: string; lastName: string; email: string };
  agent?: { id: string; name: string; referralCode: string };
}

export interface AgentDashboard {
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
  todaysFollowUps: OutreachActivity[];
  upcomingFollowUps: OutreachActivity[];
  overdueFollowUps: OutreachActivity[];
}

export interface AdminReport {
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

export interface CreateProviderInput {
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
