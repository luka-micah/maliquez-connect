import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery } from '@tanstack/react-query';
import { recommendationApi } from '../../api/authApi';
import ListingCard from '../../components/common/ListingCard';
import {
  FiThumbsUp, FiDollarSign, FiFilter, FiTrendingUp, FiZap,
  FiHash, FiMapPin, FiSearch, FiAlertCircle, FiHeart,
} from 'react-icons/fi';
import type { RecommendationListing, ApiResponse } from '../../types';
import { AxiosResponse } from 'axios';

const sectors: string[] = ['EDUCATION', 'HEALTHCARE', 'HOSPITALITY', 'LOGISTICS'];

const Recommendations = () => {
  const [budget, setBudget] = useState<string>('');
  const [budgetSector, setBudgetSector] = useState<string>('');
  const [budgetState, setBudgetState] = useState<string>('');

  const { data: recsRes, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationApi.get(),
  });

  const { data: prefRes } = useQuery({
    queryKey: ['recommendation-preferences'],
    queryFn: () => recommendationApi.getPreferences(),
  });

  const {
    data: budgetRes,
    isLoading: budgetLoading,
    refetch: fetchBudget,
  } = useQuery({
    queryKey: ['recommendations-by-budget', budget, budgetSector, budgetState],
    queryFn: () => recommendationApi.getByBudget({ budget, sector: budgetSector, state: budgetState }),
    enabled: false,
  });

  const listings: RecommendationListing[] = (recsRes?.data?.data || []) as RecommendationListing[];
  const budgetListings: RecommendationListing[] = (budgetRes?.data?.data || []) as RecommendationListing[];
  const preferences = prefRes?.data?.data;

  const handleBudgetSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!budget) return;
    fetchBudget();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SeoHead title="AI Recommendations" noindex />

      <div className="flex items-center gap-3 mb-2">
        <FiZap className="w-6 h-6 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
      </div>
      <p className="text-gray-500 mb-8 ml-9">
        Personalized suggestions based on your preferences, favorites, and browsing activity
      </p>

      <div className="space-y-10">
        {/* Preference Profile Section */}
        {preferences && (preferences.categories.length > 0 || preferences.sectors.length > 0 || preferences.recentSearches.length > 0) && (
          <section className="card p-5 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100">
            <div className="flex items-center gap-2 mb-4">
              <FiHeart className="w-5 h-5 text-primary-600" />
              <h2 className="text-base font-semibold text-gray-900">Your Preference Profile</h2>
              <span className="text-xs text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full ml-2">AI Learns From Your Activity</span>
            </div>
            <div className="flex flex-wrap gap-6">
              {preferences.categories.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preferred Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.categories.map((c) => (
                      <span key={c.id} className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-100 px-2.5 py-1 rounded-full">
                        <FiHash className="w-3 h-3" />
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {preferences.sectors.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Interested Sectors</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.sectors.map((s, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                        <FiTrendingUp className="w-3 h-3" />
                        {s.name.charAt(0) + s.name.slice(1).toLowerCase()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {preferences.priceRange && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Typical Budget</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <FiDollarSign className="w-3 h-3" />
                    Up to ${preferences.priceRange.min.toLocaleString()}
                  </span>
                </div>
              )}
              {preferences.recentSearches.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.recentSearches.slice(0, 5).map((kw, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        <FiSearch className="w-3 h-3" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Personalized Recommendations */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FiTrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Personalized For You</h2>
            <span className="text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              AI Powered
            </span>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="card p-12 text-center">
              <FiAlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load recommendations</h3>
              <p className="text-gray-500">Try again later or browse listings to help us learn your preferences.</p>
            </div>
          )}

          {!isLoading && !error && listings.length === 0 && (
            <div className="card p-12 text-center">
              <FiZap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Start favoriting listings and searching for services to help our AI learn your preferences and provide personalized suggestions.
              </p>
            </div>
          )}

          {!isLoading && !error && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing: RecommendationListing) => (
                <div key={listing.id} className="relative">
                  <ListingCard listing={listing} />
                  {listing.matchReasons && listing.matchReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                      {listing.matchReasons.map((reason, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-700 bg-primary-50 border border-primary-200 px-2 py-0.5 rounded-full"
                        >
                          <FiZap className="w-3 h-3" />
                          {reason}
                        </span>
                      ))}
                      {listing.recommendationScore !== undefined && (
                        <span className="text-[11px] font-medium text-gray-400 ml-auto">
                          {listing.recommendationScore} pts
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recommend by Budget */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FiDollarSign className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recommend by Budget</h2>
          </div>

          <div className="card p-6">
            <form onSubmit={handleBudgetSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudget(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <select
                  value={budgetSector}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBudgetSector(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">All</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={budgetState}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBudgetState(e.target.value)}
                  placeholder="e.g. California"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!budget || budgetLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:opacity-50"
                >
                  <FiFilter className="w-4 h-4" />
                  {budgetLoading ? 'Searching...' : 'Find'}
                </button>
              </div>
            </form>
          </div>

          {budgetLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!budgetLoading && budgetRes && budgetListings.length === 0 && (
            <div className="card p-8 text-center mt-6">
              <FiMapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No listings found within your budget. Try adjusting your criteria.</p>
            </div>
          )}

          {!budgetLoading && budgetListings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {budgetListings.map((listing: RecommendationListing) => (
                <div key={listing.id} className="relative">
                  <ListingCard listing={listing} />
                  {listing.matchReasons && listing.matchReasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 px-1">
                      {listing.matchReasons.map((reason, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"
                        >
                          <FiDollarSign className="w-3 h-3" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Recommendations;
