import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { blogApi } from '../../api/authApi';
import RichTextEditor from '../../components/blog/RichTextEditor';
import { plainTextToHtml, htmlToPlainText } from '../../utils/sanitizeHtml';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiEye, FiThumbsUp, FiMessageSquare, FiExternalLink, FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, BlogPost, Pagination } from '../../types';

interface PostFormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const initialForm: PostFormState = {
  title: '', slug: '', excerpt: '', content: '', tags: '', status: 'DRAFT',
};

const AdminBlogs = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<PostFormState>(initialForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<BlogPost | null>(null);

  const { data, isLoading, error } = useQuery<AxiosResponse<ApiResponse<BlogPost[]>>>({
    queryKey: ['admin-blog-posts', page],
    queryFn: () => blogApi.getAll({ page, limit: 10 }),
  });

  const posts: BlogPost[] = data?.data?.data || [];
  const pagination: Pagination | undefined = data?.data?.pagination;

  const invalidatePosts = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
  };

  const buildFormData = (body: PostFormState): FormData => {
    const fd = new FormData();
    fd.append('title', body.title);
    if (body.slug.trim()) fd.append('slug', body.slug.trim());
    if (body.excerpt) fd.append('excerpt', body.excerpt);
    fd.append('content', body.content);
    fd.append('tags', JSON.stringify(body.tags.split(',').map((t) => t.trim()).filter(Boolean)));
    fd.append('status', body.status);
    if (coverFile) {
      fd.append('coverImage', coverFile);
    }
    if (editing && removeCover) {
      fd.append('removeCoverImage', 'true');
    }
    return fd;
  };

  const createMutation = useMutation<any, any, PostFormState>({
    mutationFn: (body: PostFormState) => blogApi.create(buildFormData(body)),
    onSuccess: () => {
      invalidatePosts();
      toast.success('Post created successfully');
      closeModal();
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to create post');
    },
  });

  const updateMutation = useMutation<any, any, { id: string; body: PostFormState }>({
    mutationFn: ({ id, body }: { id: string; body: PostFormState }) => blogApi.update(id, buildFormData(body)),
    onSuccess: () => {
      invalidatePosts();
      toast.success('Post updated successfully');
      closeModal();
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update post');
    },
  });

  const deleteMutation = useMutation<any, any, string>({
    mutationFn: (id: string) => blogApi.delete(id),
    onSuccess: () => {
      invalidatePosts();
      toast.success('Post deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to delete post');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setCoverFile(null);
    setRemoveCover(false);
    setModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: plainTextToHtml(post.excerpt || ''),
      content: plainTextToHtml(post.content),
      tags: (post.tags || []).join(', '),
      status: post.status,
    });
    setCoverFile(null);
    setRemoveCover(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
    setCoverFile(null);
    setRemoveCover(false);
  };

  const handleCoverSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit');
      return;
    }
    setCoverFile(file);
    setRemoveCover(false);
  };

  const currentCoverUrl = coverFile ? URL.createObjectURL(coverFile) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!htmlToPlainText(form.content)) {
      toast.error('Content is required');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, body: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isLoadingAction = createMutation.isPending || updateMutation.isPending;

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Blog</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load blog posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Admin — Blog" noindex />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Blog</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Write Post
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No blog posts yet. Click "Write Post" to create one.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Author</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Engagement</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {posts.map((post: BlogPost) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[280px]">
                        <p className="truncate">{post.title}</p>
                        <p className="text-xs text-gray-400 font-normal">/{post.slug}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {post.author ? `${post.author.firstName} ${post.author.lastName}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${post.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><FiEye className="w-3.5 h-3.5" /> {post.viewCount}</span>
                          <span className="flex items-center gap-1"><FiThumbsUp className="w-3.5 h-3.5" /> {post.likeCount}</span>
                          <span className="flex items-center gap-1"><FiMessageSquare className="w-3.5 h-3.5" /> {post._count?.comments ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === 'PUBLISHED' && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-sm text-primary-600 hover:text-primary-800"
                              aria-label="View post"
                            >
                              <FiExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => openEdit(post)}
                            className="btn-sm text-primary-600 hover:text-primary-800"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(post)}
                            className="btn-sm text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-200">
              {posts.map((post: BlogPost) => (
                <div key={post.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FiEye className="w-3 h-3" /> {post.viewCount}</span>
                        <span className="flex items-center gap-1"><FiThumbsUp className="w-3 h-3" /> {post.likeCount}</span>
                        <span className="flex items-center gap-1"><FiMessageSquare className="w-3 h-3" /> {post._count?.comments ?? 0}</span>
                      </div>
                    </div>
                    <span className={`badge flex-shrink-0 ${post.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}`}>
                      {post.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(post)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 py-4 border-t border-gray-200">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div
            className="bg-white rounded-xl p-4 w-full max-w-2xl mx-4 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {editing ? 'Edit Post' : 'Write Post'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, slug: e.target.value })}
                    className="input-field text-sm"
                    placeholder="auto-generated from title"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Excerpt</label>
                <RichTextEditor
                  value={form.excerpt}
                  onChange={(html: string) => setForm({ ...form, excerpt: html })}
                  placeholder="Short summary shown on the blog listing"
                  compact
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Content *</label>
                <RichTextEditor
                  value={form.content}
                  onChange={(html: string) => setForm({ ...form, content: html })}
                  placeholder="Write your post content here..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cover Image</label>
                  <div className="flex gap-3">
                    {(currentCoverUrl || (editing && !removeCover && editing.coverImage)) ? (
                      <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                        <img
                          src={currentCoverUrl || (editing && editing.coverImage) || ''}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCoverFile(null);
                            if (editing?.coverImage) setRemoveCover(true);
                          }}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-white/80 text-gray-600 hover:text-red-600"
                          aria-label="Remove cover image"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 flex-shrink-0">
                        <FiImage className="w-6 h-6" />
                      </div>
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center gap-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors text-center">
                      <FiUpload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {coverFile ? coverFile.name : editing?.coverImage && !removeCover ? 'Replace cover image' : 'Upload cover image'}
                      </span>
                      <span className="text-[11px] text-gray-400">JPG, PNG or WEBP &middot; Max 5MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          handleCoverSelect(e.target.files?.[0]);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {removeCover && !coverFile && (
                    <p className="text-xs text-red-500 mt-1">Current cover will be removed on save.</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, tags: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. Education, Tips, Guide"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, status: e.target.value as 'DRAFT' | 'PUBLISHED' })}
                  className="input-field text-sm"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary text-sm">Cancel</button>
                <button type="submit" disabled={isLoadingAction} className="btn-primary text-sm">
                  {isLoadingAction ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Post</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This will also remove all comments and likes. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                disabled={deleteMutation.isPending}
                className="btn-danger"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
