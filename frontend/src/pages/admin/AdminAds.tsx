import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { adApi } from '../../api/authApi';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, Ad } from '../../types';

interface AdFormState {
  title: string;
  image: string;
  linkUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
  startDate: string;
  endDate: string;
}

const initialForm: AdFormState = {
  title: '', image: '', linkUrl: '', status: 'ACTIVE', startDate: '', endDate: '',
};

const AdminAds = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Ad | null>(null);
  const [form, setForm] = useState<AdFormState>(initialForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Ad | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['ads'],
    queryFn: () => adApi.getAll(),
  });

  const ads: Ad[] = data?.data?.data || [];

  const createMutation = useMutation<any, any, AdFormState>({
    mutationFn: (body: AdFormState) => adApi.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Ad created successfully');
      closeModal();
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to create ad');
    },
  });

  const updateMutation = useMutation<any, any, { id: string; body: AdFormState }>({
    mutationFn: ({ id, body }: { id: string; body: AdFormState }) => adApi.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Ad updated successfully');
      closeModal();
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update ad');
    },
  });

  const deleteMutation = useMutation<any, any, string>({
    mutationFn: (id: string) => adApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Ad deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to delete ad');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (ad: Ad) => {
    setEditing(ad);
    setForm({
      title: ad.title,
      image: ad.image,
      linkUrl: ad.linkUrl || '',
      status: ad.status,
      startDate: ad.startDate ? ad.startDate.slice(0, 16) : '',
      endDate: ad.endDate ? ad.endDate.slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Ads</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load ads. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Admin — Ads" noindex />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Ads</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Create Ad
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No ads yet. Click "Create Ad" to add one.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Link</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Schedule</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ads.map((ad: Ad) => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <img src={ad.image} alt={ad.title} className="w-16 h-10 object-cover rounded" />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ad.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                        {ad.linkUrl ? (
                          <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                            {ad.linkUrl} <FiExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : 'Any'} — {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : 'Any'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ad.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(ad)}
                            className="btn-sm text-primary-600 hover:text-primary-800"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(ad)}
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
              {ads.map((ad: Ad) => (
                <div key={ad.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <img src={ad.image} alt={ad.title} className="w-12 h-8 object-cover rounded" />
                        <p className="text-sm font-semibold text-gray-900">{ad.title}</p>
                      </div>
                      {ad.linkUrl && (
                        <p className="text-xs text-primary-600 truncate mt-1">{ad.linkUrl}</p>
                      )}
                    </div>
                    <span className={`badge flex-shrink-0 ${ad.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {ad.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(ad)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ad)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? 'Edit Ad' : 'Create Ad'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, image: e.target.value })}
                  className="input-field"
                  required
                  placeholder="https://example.com/image.jpg"
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-20 object-cover rounded" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (optional)</label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, linkUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (optional)</label>
                  <input
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="input-field"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoadingAction} className="btn-primary">
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Ad</h2>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
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

export default AdminAds;
