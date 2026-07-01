import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { recommendationApi } from '../../api/authApi';
import { FiThumbsUp, FiDollarSign, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { ApiResponse, Listing, Recommendation } from '../../types';

interface RecommendationsQueryResult {
  recommendations?: Recommendation[];
}

const sectors: string[] = ['EDUCATION', 'HEALTHCARE', 'HOSPITALITY', 'LOGISTICS'];

const Recommendations = () => {
  const [budget, setBudget] = useState<string>('');
  const [budgetSector, setBudgetSector] = useState<string>('');
  const [budgetState, setBudgetState] = useState<string>('');

  const { data: recsRes, isLoading, error } = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => recommendationApi.get(),
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

  const recommendations: Recommendation[] = (recsRes?.data?.data || []) as unknown as Recommendation[];
  const budgetRecommendations: Recommendation[] = (budgetRes?.data?.data || []) as unknown as Recommendation[];

  const handleBudgetSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!budget) return;
    fetchBudget();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <FiThumbsUp className="w-6 h-6 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <FiTrendingUp className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h2>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-2">Failed to load recommendations.</p>
              <p className="text-gray-400 text-sm">Try again later or adjust your preferences.</p>
            </div>
          )}

          {!isLoading && !error && recommendations.length === 0 && (
            <div className="card p-12 text-center">
              <FiThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
              <p className="text-gray-500">
                As you browse and favorite listings, we will tailor recommendations for you.
              </p>
            </div>
          )}

          {!isLoading && !error && recommendations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendations.map((rec: Recommendation) => (
                <Link
                  key={rec._id}
                  to={`/listings/${(rec.listing as Listing)._id || rec.listing}`}
                  className="card p-5 hover:shadow-md transition-shadow block"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {typeof rec.listing === 'object' && rec.listing?.title || 'Listing'}
                  </h3>
                  {rec.reason && (
                    <p className="text-sm text-gray-500 mb-3">{rec.reason}</p>
                  )}
                  {rec.score !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                        Score: {typeof rec.score === 'number' ? rec.score.toFixed(1) : rec.score}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

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
                <div key={i} className="card animate-pulse p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              ))}
            </div>
          )}

          {!budgetLoading && budgetRes && budgetRecommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No listings found within your budget.
            </div>
          )}

          {!budgetLoading && budgetRecommendations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              {budgetRecommendations.map((rec: Recommendation) => (
                <Link
                  key={rec._id}
                  to={`/listings/${(rec.listing as Listing)._id || rec.listing}`}
                  className="card p-5 hover:shadow-md transition-shadow block"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {typeof rec.listing === 'object' && rec.listing?.title || 'Listing'}
                  </h3>
                  {rec.reason && (
                    <p className="text-sm text-gray-500 mb-3">{rec.reason}</p>
                  )}
                  {rec.score !== undefined && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        Score: {typeof rec.score === 'number' ? rec.score.toFixed(1) : rec.score}
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Recommendations;
