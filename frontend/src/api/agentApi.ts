import api from './axios';
import type { AxiosResponse } from 'axios';
import type {
  ApiResponse, AgentProfile, AgentDashboard, ProviderOnboarding,
  OutreachActivity, CreateProviderInput, Pagination,
} from '../types';

export const agentApi = {
  getProfile: (): Promise<AxiosResponse<ApiResponse<AgentProfile>>> =>
    api.get('/agents/profile'),
  updateProfile: (data: Partial<AgentProfile>): Promise<AxiosResponse<ApiResponse<AgentProfile>>> =>
    api.put('/agents/profile', data),
  getDashboard: (): Promise<AxiosResponse<ApiResponse<AgentDashboard>>> =>
    api.get('/agents/dashboard'),
  getProviders: (params?: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<ProviderOnboarding[]> & { pagination: Pagination }>> =>
    api.get('/agents/providers', { params }),
  getProvider: (id: string): Promise<AxiosResponse<ApiResponse<ProviderOnboarding>>> =>
    api.get(`/agents/providers/${id}`),
  createProvider: (data: CreateProviderInput): Promise<AxiosResponse<ApiResponse<ProviderOnboarding>>> =>
    api.post('/agents/providers', data),
  updateProvider: (id: string, data: Partial<ProviderOnboarding>): Promise<AxiosResponse<ApiResponse<ProviderOnboarding>>> =>
    api.put(`/agents/providers/${id}`, data),
  updateProviderStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse<ProviderOnboarding>>> =>
    api.put(`/agents/providers/${id}/status`, { status }),
  sendInvitation: (id: string): Promise<AxiosResponse<ApiResponse<ProviderOnboarding>>> =>
    api.post(`/agents/providers/${id}/invite`),
  resendInvitation: (id: string): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post(`/agents/providers/${id}/resend-invitation`),
  createFollowUp: (data: { providerId: string; activityType: string; note?: string; nextFollowUp?: string }): Promise<AxiosResponse<ApiResponse<OutreachActivity>>> =>
    api.post('/agents/follow-ups', data),
  getActivities: (params?: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<OutreachActivity[]>>> =>
    api.get('/agents/activities', { params }),
  getFollowUps: (): Promise<AxiosResponse<ApiResponse<{ todaysFollowUps: OutreachActivity[]; upcomingFollowUps: OutreachActivity[]; overdueFollowUps: OutreachActivity[] }>>> =>
    api.get('/agents/follow-ups'),
};
