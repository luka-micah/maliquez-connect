import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { eventApi } from '../../api/authApi';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiExternalLink, FiCalendar, FiMapPin, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, AppEvent } from '../../types';

interface EventFormState {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  linkUrl: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const initialForm: EventFormState = {
  title: '', description: '', date: '', time: '', location: '', linkUrl: '', status: 'ACTIVE',
};

const AdminEvents = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<AppEvent | null>(null);
  const [form, setForm] = useState<EventFormState>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AppEvent | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventApi.getAll(),
  });

  const events: AppEvent[] = data?.data?.data || [];

  const buildFormData = (body: EventFormState): FormData => {
    const fd = new FormData();
    fd.append('title', body.title);
    if (body.description) fd.append('description', body.description);
    if (imageFile) {
      fd.append('image', imageFile);
    }
    if (body.date) fd.append('date', body.date);
    if (body.time) fd.append('time', body.time);
    if (body.location) fd.append('location', body.location);
    if (body.linkUrl) fd.append('linkUrl', body.linkUrl);
    fd.append('status', body.status);
    if (editing && removeImage) {
      fd.append('removeImage', 'true');
    }
    return fd;
  };

  const createMutation = useMutation<any, any, EventFormState>({
    mutationFn: (body: EventFormState) => eventApi.create(buildFormData(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully');
      closeModal();
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to create event');
    },
  });

  const updateMutation = useMutation<any, any, { id: string; body: EventFormState }>({
    mutationFn: ({ id, body }: { id: string; body: EventFormState }) => eventApi.update(id, buildFormData(body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event updated successfully');
      closeModal();
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to update event');
    },
  });

  const deleteMutation = useMutation<any, any, string>({
    mutationFn: (id: string) => eventApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event deleted successfully');
      setDeleteConfirm(null);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr?.response?.data?.message || 'Failed to delete event');
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setImageFile(null);
    setRemoveImage(false);
    setModalOpen(true);
  };

  const openEdit = (ev: AppEvent) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      description: ev.description || '',
      date: ev.date ? ev.date.slice(0, 16) : '',
      time: ev.time || '',
      location: ev.location || '',
      linkUrl: ev.linkUrl || '',
      status: ev.status,
    });
    setImageFile(null);
    setRemoveImage(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(initialForm);
    setImageFile(null);
    setRemoveImage(false);
  };

  const handleImageSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit');
      return;
    }
    setImageFile(file);
    setRemoveImage(false);
  };

  const currentImageUrl = imageFile ? URL.createObjectURL(imageFile) : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Events</h1>
        <div className="card p-8 text-center">
          <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600">Failed to load events. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SeoHead title="Admin — Events" noindex />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Create Event
        </button>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No events yet. Click "Create Event" to add one.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Location</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((ev: AppEvent) => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{ev.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {ev.date ? new Date(ev.date).toLocaleDateString() : '—'}
                        {ev.time && <span className="ml-1 text-xs">{ev.time}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                        {ev.location || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${ev.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(ev)}
                            className="btn-sm text-primary-600 hover:text-primary-800"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(ev)}
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
              {events.map((ev: AppEvent) => (
                <div key={ev.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                        {ev.date && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" /> {new Date(ev.date).toLocaleDateString()}
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" /> {ev.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`badge flex-shrink-0 ${ev.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                      {ev.status}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openEdit(ev)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ev)}
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
          <div className="bg-white rounded-xl p-4 w-full max-w-md mx-4 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {editing ? 'Edit Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })}
                  className="input-field text-sm"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Image (optional)</label>
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <FiUpload className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {imageFile ? imageFile.name : editing ? 'Replace image (optional)' : 'Upload image'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleImageSelect(e.target.files?.[0])}
                  />
                </label>
                {imageFile && currentImageUrl ? (
                  <img src={currentImageUrl} alt="Preview" className="mt-1 h-16 object-cover rounded" />
                ) : !imageFile && editing?.image && !removeImage ? (
                  <img src={editing.image} alt="Preview" className="mt-1 h-16 object-cover rounded" />
                ) : null}
                {editing?.image && !removeImage && !imageFile && (
                  <label className="flex items-center gap-1.5 mt-1 text-xs text-red-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeImage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemoveImage(e.target.checked)}
                    />
                    Remove image
                  </label>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, date: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, time: e.target.value })}
                    className="input-field text-sm"
                    placeholder="e.g. 10:00 AM"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, location: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g. Online or venue address"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, linkUrl: e.target.value })}
                  className="input-field text-sm"
                  placeholder="https://example.com/event"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                  className="input-field text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Event</h2>
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

export default AdminEvents;
