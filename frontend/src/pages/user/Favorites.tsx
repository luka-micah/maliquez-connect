import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { favoriteApi } from '../../api/authApi';
import ListingCard from '../../components/common/ListingCard';
import Pagination from '../../components/common/Pagination';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, Favorite, Pagination as PaginationType } from '../../types';

interface FavoritesQueryResult {
  favorites?: Favorite[];
  pagination?: PaginationType;
}

const Favorites = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState<number>(1);

  const { data: favoritesRes, isLoading, error } = useQuery({
    queryKey: ['favorites', page],
    queryFn: () => favoriteApi.getAll({ page }),
  });

  const removeMutation = useMutation<any, any, string>({
    mutationFn: (id: string) => favoriteApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
    onError: () => toast.error('Failed to remove favorite'),
  });

  const favorites: Favorite[] = favoritesRes?.data?.data || [];
  const pagination = (favoritesRes?.data?.pagination || { page: 1 }) as PaginationType;

  const handleRemove = (listingId: string) => {
    const fav = Array.isArray(favorites) ? favorites.find((f: Favorite) => f.listing?.id === listingId) : null;
    if (fav?.id) {
      removeMutation.mutate(fav.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SeoHead title="My Favorites" noindex />
      <div className="flex items-center gap-3 mb-8">
        <FiHeart className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
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
          <p className="text-gray-500 mb-2">Failed to load favorites.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['favorites'] })}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && (!Array.isArray(favorites) || favorites.length === 0) && (
        <div className="text-center py-16">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">
            Start exploring and save listings you love to see them here.
          </p>
          <a
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Browse Listings
          </a>
        </div>
      )}

      {!isLoading && !error && Array.isArray(favorites) && favorites.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {favorites.map((fav: Favorite) => (
              <div key={fav.id} className="relative group">
                <ListingCard listing={fav.listing} onFavorite={handleRemove} />
                <button
                  onClick={() => handleRemove(fav.listing?.id)}
                  disabled={removeMutation.isPending}
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  title="Remove from favorites"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {pagination && (
            <Pagination pagination={pagination} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;
