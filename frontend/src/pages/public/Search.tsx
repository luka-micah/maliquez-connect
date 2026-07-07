import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { listingApi, categoryApi } from '../../api/authApi';
import ListingCard from '../../components/common/ListingCard';
import Pagination from '../../components/common/Pagination';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { ApiResponse, Listing, Category, Pagination as PaginationType } from '../../types';

const sectors: string[] = ['EDUCATION', 'HEALTHCARE', 'HOSPITALITY', 'LOGISTICS'];

interface ListingsQueryResult {
  listings?: Listing[];
  pagination?: PaginationType;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const q = searchParams.get('q') || '';
  const sector = searchParams.get('sector') || '';
  const category = searchParams.get('category') || '';
  const state = searchParams.get('state') || '';
  const city = searchParams.get('city') || '';
  const minRating = searchParams.get('minRating') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [localQ, setLocalQ] = useState<string>(q);

  useEffect(() => {
    setLocalQ(q);
  }, [q]);

  const params: Record<string, string | number> = {};
  if (q) params.q = q;
  if (sector) params.sector = sector;
  if (category) params.category = category;
  if (state) params.state = state;
  if (city) params.city = city;
  if (minRating) params.minRating = minRating;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  params.page = page;

  const { data: listingsRes, isLoading, error } = useQuery({
    queryKey: ['listings', params],
    queryFn: () => listingApi.getAll(params),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const listings: Listing[] = listingsRes?.data?.data || [];
  const pagination = (listingsRes?.data?.pagination || { page: 1 }) as PaginationType;

  const updateParam = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      if (key !== 'page') next.set('page', '1');
      return next;
    });
  }, [setSearchParams]);

  const clearFilters = () => {
    setSearchParams({});
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateParam('q', localQ);
  };

  const hasFilters = sector || category || state || city || minRating || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <form onSubmit={handleSearch} className="relative max-w-2xl mb-8">
        <input
          type="text"
          value={localQ}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalQ(e.target.value)}
          placeholder="Search listings..."
          className="w-full px-5 py-3 pl-12 rounded-2xl border border-primary-200 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:outline-none"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700"
        >
          Search
        </button>
      </form>

      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <FiSliders className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-500" />}
        </button>
      </div>

      <div className="flex gap-8">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
          <div className="card p-4 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                  Clear all
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <select
                value={sector}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam('sector', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam('category', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {(categoriesRes?.data?.data || []).map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                value={state}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam('state', e.target.value)}
                placeholder="e.g. California"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam('city', e.target.value)}
                placeholder="e.g. Los Angeles"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <select
                value={minRating}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam('minRating', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any Rating</option>
                {[4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r}+ Stars</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam('minPrice', e.target.value)}
                  placeholder="Min"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam('maxPrice', e.target.value)}
                  placeholder="Max"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {q ? `Results for "${q}"` : 'All Listings'}
              {pagination && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({pagination.total || 0} results)
                </span>
              )}
            </h2>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-2">Something went wrong while fetching listings.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !error && listings.length === 0 && (
            <div className="text-center py-16">
              <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-4">
                {q
                  ? `No results matching "${q}". Try different keywords or filters.`
                  : 'No listings match your current filters.'}
              </p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-primary-600 hover:text-primary-700 font-medium">
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && listings.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              {pagination && (
                <Pagination
                  pagination={pagination}
                  onPageChange={(p: number) => updateParam('page', p.toString())}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
