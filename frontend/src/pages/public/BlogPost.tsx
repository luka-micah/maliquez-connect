import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { blogApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import SeoHead from '../../components/seo/SeoHead';
import toast from 'react-hot-toast';
import {
  FiArrowLeft, FiThumbsUp, FiShare2, FiMessageSquare, FiEye,
  FiAlertCircle, FiCalendar, FiUser, FiTrash2, FiSend, FiFileText,
} from 'react-icons/fi';
import { ApiResponse, BlogComment, BlogPost } from '../../types';
import { sanitizeHtml, hasHtmlTags } from '../../utils/sanitizeHtml';

const formatDate = (date?: string) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [liked, setLiked] = useState<boolean | null>(null);

  const { data, isLoading, error } = useQuery<AxiosResponse<ApiResponse<BlogPost>>>({
    queryKey: ['blog-post', slug],
    queryFn: () => blogApi.getPublishedBySlug(slug!),
    enabled: Boolean(slug),
  });

  const post: BlogPost | undefined = data?.data?.data;

  const { data: commentsData, isLoading: commentsLoading } = useQuery<AxiosResponse<ApiResponse<BlogComment[]>>>({
    queryKey: ['blog-comments', post?.slug],
    queryFn: () => blogApi.getComments(post!.slug),
    enabled: Boolean(post),
  });

  const comments: BlogComment[] = commentsData?.data?.data || [];

  const likeMutation = useMutation<any, any, string>({
    mutationFn: (postId: string) => blogApi.toggleLike(postId),
    onSuccess: (res) => {
      const result = res.data.data;
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    },
    onError: () => {
      toast.error('Failed to update like');
    },
  });

  const commentMutation = useMutation<any, any, { postId: string; content: string }>({
    mutationFn: ({ postId, content }: { postId: string; content: string }) => blogApi.addComment(postId, content),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['blog-comments', post?.slug] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', slug] });
      toast.success('Comment added');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to add comment');
    },
  });

  const deleteCommentMutation = useMutation<any, any, string>({
    mutationFn: (commentId: string) => blogApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-comments', post?.slug] });
      queryClient.invalidateQueries({ queryKey: ['blog-post', slug] });
      toast.success('Comment deleted');
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to delete comment');
    },
  });

  const handleLike = () => {
    if (!post) return;
    if (!isAuthenticated) {
      toast.error('Please login to like this post');
      navigate('/login', { state: { from: { pathname: `/blog/${post.slug}` } } });
      return;
    }
    likeMutation.mutate(post.id);
  };

  const handleShare = async () => {
    if (!post) return;
    const url = window.location.href;
    const shareData = {
      title: post.title,
      text: post.excerpt || post.title,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!post) return;
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      navigate('/login', { state: { from: { pathname: `/blog/${post.slug}` } } });
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate({ postId: post.id, content: commentText.trim() });
  };

  const effectiveLikeCount = likeCount ?? post?.likeCount ?? 0;
  const effectiveLiked = liked ?? post?.liked ?? false;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-3xl px-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-2/3 animate-pulse" />
          <div className="h-72 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card p-12 text-center max-w-md w-full">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-500 mb-6">This blog post may have been removed or unpublished.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
            <FiArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const isAuthorOrAdmin = (comment: BlogComment) =>
    user?.id === comment.userId || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <div>
      <SeoHead
        title={post.title}
        description={post.excerpt || post.title}
        canonical={`/blog/${post.slug}`}
        image={post.coverImage}
        type="article"
        publishedTime={post.publishedAt || post.createdAt}
        author={post.author ? `${post.author.firstName} ${post.author.lastName}` : undefined}
      />

      <article className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 mb-6">
            <FiArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium text-primary-600 bg-primary-50 rounded-full px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 mb-8">
            <span className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                {post.author?.avatar ? (
                  <img src={post.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <FiUser className="w-4 h-4 text-primary-600" />
                )}
              </span>
              <span className="font-medium text-gray-700">
                {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Maliquez Connect'}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <FiCalendar className="w-4 h-4 text-primary-500" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <FiEye className="w-4 h-4 text-primary-500" /> {post.viewCount} views
            </span>
          </div>

          {post.coverImage && (
            <img src={post.coverImage} alt={post.title} className="w-full rounded-2xl shadow-sm mb-8 max-h-[480px] object-cover" />
          )}

          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 mb-8">
            {hasHtmlTags(post.content) ? (
              <div
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
              />
            ) : (
              <div className="rich-text-content whitespace-pre-line">{post.content}</div>
            )}

            <div className="flex items-center gap-3 border-t border-gray-100 pt-6 mt-10">
              <button
                onClick={handleLike}
                disabled={likeMutation.isPending}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  effectiveLiked
                    ? 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-60`}
              >
                <FiThumbsUp className="w-4 h-4" /> {effectiveLiked ? 'Liked' : 'Like'} ({effectiveLikeCount})
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FiShare2 className="w-4 h-4" /> Share
              </button>
              <span className="ml-auto hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <FiMessageSquare className="w-4 h-4 text-primary-500" /> {comments.length} comments
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FiMessageSquare className="w-5 h-5 text-primary-600" /> Comments ({comments.length})
            </h2>

            <form onSubmit={handleCommentSubmit} className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isAuthenticated ? 'Add a comment' : 'Login to join the conversation'}
              </label>
              <div className="flex gap-3">
                <textarea
                  value={commentText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)}
                  rows={2}
                  placeholder="Share your thoughts..."
                  className="input-field text-sm flex-1"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || commentMutation.isPending}
                  className="btn-primary self-end inline-flex items-center gap-2"
                >
                  <FiSend className="w-4 h-4" /> Post
                </button>
              </div>
            </form>

            {commentsLoading && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            )}

            {!commentsLoading && comments.length === 0 && (
              <div className="text-center py-8">
                <FiFileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}

            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    {comment.user.avatar ? (
                      <img src={comment.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <FiUser className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                      {isAuthorOrAdmin(comment) && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                          className="ml-auto text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete comment"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;
