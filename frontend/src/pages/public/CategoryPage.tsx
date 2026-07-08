import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { categoryApi, listingApi } from '../../api/authApi';
import ListingCard from '../../components/common/ListingCard';
import Pagination from '../../components/common/Pagination';
import SeoHead from '../../components/seo/SeoHead';
import { CollectionPageJsonLd } from '../../components/seo/JsonLd';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { ApiResponse, Listing, Pagination as PaginationType } from '../../types';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: catRes, isLoading: catLoading } = useQuery({
    queryKey: ['category-by-slug', slug],
    queryFn: () => categoryApi.getById(slug!),
    enabled: !!slug,
  });

  const category = catRes?.data?.data;
  const categoryId = category?.id;

  const { data: listingsRes, isLoading: listingsLoading } = useQuery({
    queryKey: ['category-listings', categoryId, page],
    queryFn: () => listingApi.getAll({ category: categoryId, page, limit: 12 }),
    enabled: !!categoryId,
  });

  const listings: Listing[] = listingsRes?.data?.data || [];
  const pagination = listingsRes?.data?.pagination as PaginationType | undefined;

  const catName = category?.name || slug || 'Category';
  const catDescription = category?.description || `Browse verified ${catName} service providers on Maliquez Connect.`;

  useEffect(() => {
    setPage(1);
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SeoHead
        title={catName}
        description={catDescription}
        canonical={`/categories/${slug}`}
      />
      <CollectionPageJsonLd
        name={catName}
        description={catDescription}
        url={`https://maliquez.com/categories/${slug}`}
      />

      <Link to="/categories" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-4">
        <FiArrowLeft className="w-4 h-4" /> All Categories
      </Link>

      {catLoading ? (
        <div className="animate-pulse mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
      ) : (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{catName}</h1>
          {category?.description && (
            <p className="text-gray-500 mt-2">{category.description}</p>
          )}
        </div>
      )}

      {listingsLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse card">
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

      {!listingsLoading && listings.length === 0 && (
        <div className="text-center py-16">
          <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-500">No providers listed in this category yet.</p>
        </div>
      )}

      {!listingsLoading && listings.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {pagination && (
            <Pagination
              pagination={pagination}
              onPageChange={(p: number) => setPage(p)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CategoryPage;
