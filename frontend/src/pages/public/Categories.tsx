import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { categoryApi } from '../../api/authApi';
import SeoHead from '../../components/seo/SeoHead';
import { CollectionPageJsonLd } from '../../components/seo/JsonLd';
import { FiSearch, FiChevronRight, FiFolder } from 'react-icons/fi';
import { ApiResponse, Category } from '../../types';

const Categories = () => {
  const [search, setSearch] = useState<string>('');

  const { data: categoriesRes, isLoading, error } = useQuery<AxiosResponse<ApiResponse<Category[]>>>({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const categories: Category[] = categoriesRes?.data?.data || [];

  const filtered = search
    ? categories.filter(
        (cat: Category) =>
          cat.name?.toLowerCase().includes(search.toLowerCase()) ||
          cat.description?.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SeoHead
        title="Categories"
        description="Browse service providers by category on Maliquez Connect. Find schools, hospitals, hotels, logistics companies and more."
        canonical="/categories"
      />
      <CollectionPageJsonLd
        name="Categories"
        description="Browse service provider categories on Maliquez Connect."
        url="https://maliquez.com/categories"
      />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
        <p className="text-gray-500">Browse listings by category to find exactly what you need</p>
      </div>

      <div className="relative max-w-md mb-8">
        <input
          type="text"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full px-5 py-3 pl-12 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:outline-none"
        />
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5" />
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse p-6">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">Failed to load categories. Please try again later.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500">
            {search ? `No categories matching "${search}".` : 'No categories available yet.'}
          </p>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((category: Category) => (
            <Link
              key={category.id}
              to={`/categories/${category.slug || category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:bg-primary-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-700 group-hover:text-white transition-all duration-300">
                <FiFolder className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-brand-darkText group-hover:text-primary-700 transition-colors">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-gray-500 text-sm mt-2 line-clamp-2">{category.description}</p>
              )}
              <div className="flex items-center gap-1 text-primary-600 text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                Browse listings <FiChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
