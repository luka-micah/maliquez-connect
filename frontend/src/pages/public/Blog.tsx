import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { blogApi } from '../../api/authApi';
import SeoHead from '../../components/seo/SeoHead';
import { FiCalendar, FiMessageSquare, FiThumbsUp, FiEye, FiAlertCircle, FiFileText, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ApiResponse, BlogPost, Pagination } from '../../types';
import { sanitizeHtml, hasHtmlTags } from '../../utils/sanitizeHtml';

const formatDate = (date?: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const Blog = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery<AxiosResponse<ApiResponse<BlogPost[]>>>({
    queryKey: ['published-blog-posts', page],
    queryFn: () => blogApi.getPublished({ page, limit: 9 }),
  });

  const posts: BlogPost[] = data?.data?.data || [];
  const pagination: Pagination | undefined = data?.data?.pagination;

  return (
    <div>
      <SeoHead
        title="Blog"
        description="Insights, guides, and news from Maliquez Connect to help you make confident decisions."
        canonical="/blog"
      />

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">Blog</span>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">Insights & Guides</h1>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Discover, compare, and decide with expert insights across education, healthcare, hospitality, and logistics.
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="card p-12 text-center">
              <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-gray-600">Failed to load blog posts. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && posts.length === 0 && (
            <div className="card p-12 text-center">
              <FiFileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No blog posts yet. Check back soon!</p>
            </div>
          )}

          {!isLoading && !error && posts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                      <FiFileText className="w-12 h-12 text-primary-400" />
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[11px] font-medium text-primary-600 bg-primary-50 rounded-full px-2.5 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                    {post.excerpt && (
                      hasHtmlTags(post.excerpt) ? (
                        <div
                          className="rich-text-content text-sm text-gray-500 mb-4 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.excerpt) }}
                        />
                      ) : (
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{post.excerpt}</p>
                      )
                    )}
                    <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar className="w-3.5 h-3.5 text-primary-500" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FiThumbsUp className="w-3.5 h-3.5" /> {post.likeCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiMessageSquare className="w-3.5 h-3.5" /> {post._count?.comments ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiEye className="w-3.5 h-3.5" /> {post.viewCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Blog;
