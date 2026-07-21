import api from './axios';
import type { AxiosResponse } from 'axios';
import type {
  ApiResponse,
  User,
  RegisterInput,
  LoginInput,
  Category,
  Listing,
  Review,
  Favorite,
  Comparison,
  SearchHistory,
  Notification,
  Ad,
  AppEvent,
  EventRegistration,
  AdminDashboard,
  ProviderAnalytics,
  Conversation,
  Message,
} from '../types';

type AuthResponse = { user: User; accessToken: string; refreshToken: string };

type PaginationParams = {
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: unknown;
};

export const authApi = {
  register: (data: RegisterInput): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/register', data),
  login: (data: LoginInput): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/login', data),
  logout: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/auth/logout'),
  getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.get('/auth/profile'),
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.put('/auth/profile', data),
  forgotPassword: (email: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post('/auth/reset-password', data),
};

export const categoryApi = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Category[]>>> =>
    api.get('/categories'),
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.get(`/categories/${id}`),
  create: (data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.post('/categories', data),
  update: (id: string, data: Partial<Category>): Promise<AxiosResponse<ApiResponse<Category>>> =>
    api.put(`/categories/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/categories/${id}`),
};

export const listingApi = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/listings', { params }),
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Listing>>> =>
    api.get(`/listings/${id}`),
  getMine: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/listings/mine', { params }),
  create: (data: FormData): Promise<AxiosResponse<ApiResponse<Listing>>> =>
    api.post('/listings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: string, data: FormData): Promise<AxiosResponse<ApiResponse<Listing>>> =>
    api.put(`/listings/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/listings/${id}`),
};

export const searchApi = {
  search: (params: PaginationParams): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/search', { params }),
  getSuggestions: (q: string): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get('/search/suggestions', { params: { q } }),
  getTrending: (): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/search/trending'),
  getRecent: (): Promise<AxiosResponse<ApiResponse<SearchHistory[]>>> =>
    api.get('/search/recent'),
};

export const reviewApi = {
  getListingReviews: (id: string, params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Review[]>>> =>
    api.get(`/reviews/listing/${id}`, { params }),
  create: (data: { listing: string; rating: number; review?: string }): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.post('/reviews', data),
  update: (id: string, data: { rating?: number; review?: string }): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.put(`/reviews/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/reviews/${id}`),
  markHelpful: (id: string): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.post(`/reviews/${id}/helpful`),
  report: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post(`/reviews/${id}/report`),
};

export const favoriteApi = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Favorite[]>>> =>
    api.get('/favorites', { params }),
  add: (listingId: string): Promise<AxiosResponse<ApiResponse<Favorite>>> =>
    api.post('/favorites', { listingId }),
  remove: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/favorites/${id}`),
};

export const comparisonApi = {
  create: (data: { listings: string[]; fields: Partial<Record<string, string[]>> }): Promise<AxiosResponse<ApiResponse<Comparison>>> =>
    api.post('/comparisons', data),
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Comparison>>> =>
    api.get(`/comparisons/${id}`),
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/comparisons/${id}`),
};

export const recommendationApi = {
  get: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/recommendations', { params }),
  getByBudget: (params?: { min?: number; max?: number } & PaginationParams): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/recommendations/by-budget', { params }),
  getPreferences: (): Promise<AxiosResponse<ApiResponse<{
    categories: { id: string; name: string }[];
    sectors: { name: string }[];
    priceRange: { min: number; max: number | null } | null;
    recentSearches: string[];
  }>>> =>
    api.get('/recommendations/preferences'),
};

export const chatApi = {
  createConversation: (listingId: string): Promise<AxiosResponse<ApiResponse<Conversation>>> =>
    api.post('/chats', { listingId }),
  getConversations: (): Promise<AxiosResponse<ApiResponse<Conversation[]>>> =>
    api.get('/chats'),
  getConversation: (id: string): Promise<AxiosResponse<ApiResponse<Conversation>>> =>
    api.get(`/chats/${id}`),
  getMessages: (id: string): Promise<AxiosResponse<ApiResponse<Message[]>>> =>
    api.get(`/chats/${id}/messages`),
  markRead: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.put(`/chats/${id}/read`),
};

export const notificationApi = {
  getAll: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Notification[]>>> =>
    api.get('/notifications', { params }),
  getUnreadCount: (): Promise<AxiosResponse<ApiResponse<{ count: number }>>> =>
    api.get('/notifications/unread-count'),
  markRead: (id: string): Promise<AxiosResponse<ApiResponse<Notification>>> =>
    api.put(`/notifications/${id}/read`),
  markAllRead: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.put('/notifications/read-all'),
};

export const adApi = {
  getActive: (): Promise<AxiosResponse<ApiResponse<Ad[]>>> =>
    api.get('/ads/active'),
  getAll: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Ad[]>>> =>
    api.get('/ads', { params }),
  getById: (id: string): Promise<AxiosResponse<ApiResponse<Ad>>> =>
    api.get(`/ads/${id}`),
  create: (data: Partial<Ad>): Promise<AxiosResponse<ApiResponse<Ad>>> =>
    api.post('/ads', data),
  update: (id: string, data: Partial<Ad>): Promise<AxiosResponse<ApiResponse<Ad>>> =>
    api.put(`/ads/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/ads/${id}`),
};

export const eventApi = {
  getPublished: (): Promise<AxiosResponse<ApiResponse<AppEvent[]>>> =>
    api.get('/events/published'),
  getAll: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<AppEvent[]>>> =>
    api.get('/events', { params }),
  getById: (id: string): Promise<AxiosResponse<ApiResponse<AppEvent>>> =>
    api.get(`/events/${id}`),
  create: (data: Partial<AppEvent>): Promise<AxiosResponse<ApiResponse<AppEvent>>> =>
    api.post('/events', data),
  update: (id: string, data: Partial<AppEvent>): Promise<AxiosResponse<ApiResponse<AppEvent>>> =>
    api.put(`/events/${id}`, data),
  delete: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.delete(`/events/${id}`),
};

export const eventRegistrationApi = {
  register: (data: { eventId: string; firstName: string; lastName: string; email: string; phone?: string }): Promise<AxiosResponse<ApiResponse<EventRegistration>>> =>
    api.post('/event-registrations', data),
  getAll: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<EventRegistration[]>>> =>
    api.get('/event-registrations', { params }),
  getByEvent: (eventId: string, params?: PaginationParams): Promise<AxiosResponse<ApiResponse<EventRegistration[]>>> =>
    api.get(`/event-registrations/${eventId}`, { params }),
};

export const adminApi = {
  getDashboard: (): Promise<AxiosResponse<ApiResponse<AdminDashboard>>> =>
    api.get('/admin/dashboard'),
  getUsers: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<User[]>>> =>
    api.get('/admin/users', { params }),
  getProviders: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<User[]>>> =>
    api.get('/admin/providers', { params }),
  getListings: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/admin/listings', { params }),
  getPendingListings: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Listing[]>>> =>
    api.get('/admin/listings/pending', { params }),
  approveListing: (id: string): Promise<AxiosResponse<ApiResponse<Listing>>> =>
    api.put(`/admin/listings/${id}/approve`),
  suspendListing: (id: string): Promise<AxiosResponse<ApiResponse<Listing>>> =>
    api.put(`/admin/listings/${id}/suspend`),
  updateUserStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.put(`/admin/users/${id}/status`, { status }),
  verifyProvider: (id: string, verificationStatus: string): Promise<AxiosResponse<ApiResponse<User>>> =>
    api.put(`/admin/providers/${id}/verify`, { verificationStatus }),
  getReviews: (params?: PaginationParams): Promise<AxiosResponse<ApiResponse<Review[]>>> =>
    api.get('/admin/reviews', { params }),
  moderateReview: (id: string, status: string): Promise<AxiosResponse<ApiResponse<Review>>> =>
    api.put(`/admin/reviews/${id}/moderate`, { status }),
  getProviderAnalytics: (id: string): Promise<AxiosResponse<ApiResponse<ProviderAnalytics>>> =>
    api.get(`/admin/providers/${id}/analytics`),
};
