import { api } from '@/lib/api';
import type { ApiPaginated, Category, Listing, Paginated } from '@/types';

export interface ListingQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export async function getMyListings(query: ListingQuery = {}): Promise<Paginated<Listing>> {
  const { data } = await api.get<ApiPaginated<Listing>>('/listings/mine', { params: query });
  return { data: data.data, pagination: data.pagination };
}

export async function getListing(id: string): Promise<Listing> {
  const { data } = await api.get<{ success: true; data: Listing }>(`/listings/${id}`);
  return data.data;
}

export async function createListing(form: FormData): Promise<Listing> {
  const { data } = await api.post<{ success: true; data: Listing }>('/listings', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function updateListing(id: string, form: FormData): Promise<Listing> {
  const { data } = await api.put<{ success: true; data: Listing }>(`/listings/${id}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteListing(id: string): Promise<void> {
  await api.delete(`/listings/${id}`);
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<{ success: true; data: Category[] }>('/categories');
  return data.data;
}
