import { useState } from 'react';
import SeoHead from '../../components/seo/SeoHead';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { AxiosResponse } from 'axios';
import { listingApi, categoryApi } from '../../api/authApi';
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiStar, FiUpload, FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ApiResponse, Listing, Category } from '../../types';

const SECTORS: string[] = ['Education', 'Healthcare', 'Hospitality', 'Logistics'];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

interface ListingFormData {
  title: string;
  description: string;
  category: string;
  sector: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  contactWhatsapp: string;
  address: string;
  state: string;
  city: string;
  country: string;
  features: string;
  pricingMin: string;
  pricingMax: string;
  currency: string;
  mondayOpen: string;
  mondayClose: string;
  tuesdayOpen: string;
  tuesdayClose: string;
  wednesdayOpen: string;
  wednesdayClose: string;
  thursdayOpen: string;
  thursdayClose: string;
  fridayOpen: string;
  fridayClose: string;
  saturdayOpen: string;
  saturdayClose: string;
  sundayOpen: string;
  sundayClose: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUSPENDED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  categories: Category[];
}

const ListingFormModal = ({ isOpen, onClose, listing, categories }: ListingFormModalProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!listing;
  const [files, setFiles] = useState<File[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (name: string) => {
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const SectionToggle = ({ name, title, icon: Icon }: { name: string; title: string; icon?: React.ComponentType<{ className?: string }> | null }) => {
    const isOpen = openSections[name];
    return (
      <button
        type="button"
        onClick={() => toggleSection(name)}
        className="md:hidden flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-900"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          {title}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  };
  const existingMetas = listing?.imageMetadata ?? [];

  const hoursDefault = (day: string) => {
    const hours = listing?.operatingHours as Record<string, { open?: string; close?: string }> | undefined;
    return {
      open: hours?.[day]?.open || '',
      close: hours?.[day]?.close || '',
    };
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormData>({
    defaultValues: listing
      ? {
          title: listing.title || '',
          description: listing.description || '',
          category: typeof listing.category === 'object' ? listing.category?.id || '' : listing.category || '',
          sector: listing.sector || '',
          contactPhone: listing.contact?.phone || '',
          contactEmail: listing.contact?.email || '',
          contactWebsite: listing.contact?.website || '',
          contactWhatsapp: listing.contact?.whatsapp || '',
          address: listing.location?.address || '',
          state: listing.location?.state || '',
          city: listing.location?.city || '',
          country: listing.location?.country || '',
          features: listing.features?.join(', ') || '',
          pricingMin: listing.pricing?.minimum?.toString() || '',
          pricingMax: listing.pricing?.maximum?.toString() || '',
          currency: listing.pricing?.currency || 'USD',
          ...Object.fromEntries(DAYS.flatMap(d => [
            [`${d}Open`, hoursDefault(d).open],
            [`${d}Close`, hoursDefault(d).close],
          ])),
        }
      : {
          title: '', description: '', category: '', sector: '',
          contactPhone: '', contactEmail: '', contactWebsite: '', contactWhatsapp: '',
          address: '', state: '', city: '', country: '',
          features: '', pricingMin: '', pricingMax: '', currency: 'USD',
          ...Object.fromEntries(
            DAYS.flatMap<[string, string]>(d => [[`${d}Open`, ''], [`${d}Close`, '']]),
          ),
        },
  });

  const createMutation = useMutation<any, any, FormData>({
    mutationFn: (formData: FormData) => listingApi.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing created successfully');
      onClose();
      reset();
      setFiles([]);
      setRemovedPublicIds([]);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to create listing');
    },
  });

  const updateMutation = useMutation<any, any, FormData>({
    mutationFn: (formData: FormData) => listingApi.update(listing!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing updated successfully');
      onClose();
      reset();
      setFiles([]);
      setRemovedPublicIds([]);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to update listing');
    },
  });

  const buildFormData = (formData: ListingFormData): FormData => {
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('description', formData.description);
    fd.append('category', formData.category);
    fd.append('sector', formData.sector);
    fd.append('contact', JSON.stringify({
      phone: formData.contactPhone,
      email: formData.contactEmail,
      website: formData.contactWebsite,
      whatsapp: formData.contactWhatsapp,
    }));
    fd.append('location', JSON.stringify({
      address: formData.address,
      state: formData.state,
      city: formData.city,
      country: formData.country,
    }));
    fd.append('features', JSON.stringify(
      formData.features ? formData.features.split(',').map((f: string) => f.trim()).filter(Boolean) : [],
    ));
    fd.append('pricing', JSON.stringify({
      minimum: formData.pricingMin ? Number(formData.pricingMin) : undefined,
      maximum: formData.pricingMax ? Number(formData.pricingMax) : undefined,
      currency: formData.currency,
    }));
    const hours: Record<string, { open?: string; close?: string }> = {};
    const raw = formData as unknown as Record<string, string>;
    for (const d of DAYS) {
      const open = raw[`${d}Open`];
      const close = raw[`${d}Close`];
      if (open || close) {
        hours[d] = { open: open || undefined, close: close || undefined };
      }
    }
    fd.append('operatingHours', JSON.stringify(hours));
    if (removedPublicIds.length > 0) {
      fd.append('removedImages', JSON.stringify(removedPublicIds));
    }
    files.forEach((file) => fd.append('images', file));
    return fd;
  };

  const onSubmit = (formData: ListingFormData) => {
    const fd = buildFormData(formData);
    if (isEditing) {
      updateMutation.mutate(fd);
    } else {
      createMutation.mutate(fd);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4">
      <div className="bg-white rounded-t-xl md:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Listing' : 'Create New Listing'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                {...register('title', { required: 'Title is required' })}
                className={`w-full px-3 py-2 rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                {...register('description')}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`w-full px-3 py-2 rounded-lg border ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >is 
                <option value="">Select category</option>
                {categories?.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sector *</label>
              <select
                {...register('sector', { required: 'Sector is required' })}
                className={`w-full px-3 py-2 rounded-lg border ${errors.sector ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="">Select sector</option>
                {SECTORS.map((s: string) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector.message}</p>}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:border-0 md:pt-0">
            <div className="hidden md:flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Contact Information</h3>
            </div>
            <SectionToggle name="contact" title="Contact Information" icon={null} />
            <div className={`${openSections.contact ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input {...register('contactPhone')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" {...register('contactEmail')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input {...register('contactWebsite')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input {...register('contactWhatsapp')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:border-0 md:pt-0">
            <div className="hidden md:flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Location</h3>
            </div>
            <SectionToggle name="location" title="Location" icon={null} />
            <div className={`${openSections.location ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input {...register('address')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input {...register('city')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input {...register('state')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input {...register('country')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:border-0 md:pt-0">
            <SectionToggle name="features" title="Features" icon={null} />
            <div className={`${openSections.features ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma-separated)</label>
            <input {...register('features')} placeholder="e.g. 24/7 Support, Free WiFi, Parking" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:border-0 md:pt-0">
            <div className="hidden md:flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Images</h3>
            </div>
            <SectionToggle name="images" title="Images" icon={null} />
            <div className={`${openSections.images ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>

            {/* Existing images (edit mode) */}
            {existingMetas.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {existingMetas.map((meta) => {
                  const removed = removedPublicIds.includes(meta.publicId);
                  return (
                    <div
                      key={meta.publicId}
                      className={`relative w-24 h-24 rounded-lg overflow-hidden border ${removed ? 'opacity-30 border-red-400' : 'border-gray-200'}`}
                    >
                      <img src={meta.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          if (removed) {
                            setRemovedPublicIds(prev => prev.filter(id => id !== meta.publicId));
                          } else {
                            setRemovedPublicIds(prev => [...prev, meta.publicId]);
                          }
                        }}
                        className={`absolute top-1 right-1 p-0.5 rounded-full ${removed ? 'bg-green-500 text-white' : 'bg-white/80 text-gray-600 hover:text-red-600'}`}
                      >
                        {removed ? <FiPlus className="w-3.5 h-3.5" /> : <FiX className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Drop zone */}
            <label
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary-400', 'bg-primary-50'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-primary-400', 'bg-primary-50');
                const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (dropped.length + files.length + existingMetas.length - removedPublicIds.length > 10) {
                  toast.error('Maximum 10 images allowed');
                  return;
                }
                setFiles(prev => [...prev, ...dropped]);
              }}
              className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
            >
              <FiUpload className="w-6 h-6 text-gray-400" />
              <span className="text-sm text-gray-500">
                {files.length > 0
                  ? `${files.length} new file(s) selected`
                  : 'Drag & drop images here, or click to select'}
              </span>
              <span className="text-xs text-gray-400">JPG, PNG or WEBP &middot; Max 5MB each &middot; Up to 10 images</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  if (selected.length + files.length + existingMetas.length - removedPublicIds.length > 10) {
                    toast.error('Maximum 10 images allowed');
                    e.target.value = '';
                    return;
                  }
                  setFiles(prev => [...prev, ...selected]);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>

            {/* New file previews */}
            {files.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-3">
                {files.map((f, i) => (
                  <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-white/80 text-gray-600 hover:text-red-600"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:border-0 md:pt-0">
            <div className="hidden md:flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Pricing</h3>
            </div>
            <SectionToggle name="pricing" title="Pricing" icon={null} />
            <div className={`${openSections.pricing ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 hidden md:block">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input type="number" {...register('pricingMin')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input type="number" {...register('pricingMax')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select {...register('currency')} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                  <option value="KES">KES</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </div>
            </div>
          </div>
          </div>

          <div className="border-t border-gray-100 pt-4 md:border-0 md:pt-0">
            <div className="hidden md:flex items-center gap-2 mb-3">
              <FiClock className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Operating Hours</h3>
            </div>
            <SectionToggle name="hours" title="Operating Hours" icon={FiClock} />
            <div className={`${openSections.hours ? 'block' : 'hidden'} md:block mt-2 md:mt-0`}>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 space-y-2">
              <div className="hidden md:grid grid-cols-[7rem_1fr_auto_1fr] gap-2 mb-1 px-3">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Day</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Opens</span>
                <span />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Closes</span>
              </div>
              {DAYS.map((day) => (
                <div key={day} className="md:grid md:grid-cols-[7rem_1fr_auto_1fr] gap-2 items-center bg-white rounded-lg px-3 py-3 md:py-2 border border-gray-200">
                  <span className="text-sm font-medium text-gray-700 capitalize mb-1.5 md:mb-0 block md:truncate">{day}</span>
                  <div className="flex md:grid md:grid-cols-subgrid md:col-span-3 items-center gap-2">
                    <input
                      type="time"
                      {...register(`${day}Open` as keyof ListingFormData)}
                      className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                    <span className="text-xs text-gray-400 flex-shrink-0">to</span>
                    <input
                      type="time"
                      {...register(`${day}Close` as keyof ListingFormData)}
                      className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting || createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEditing
                  ? 'Update Listing'
                  : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProviderListings = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => listingApi.getMine(),
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const listings: Listing[] = data?.data?.data || [];
  const categories: Category[] = categoriesRes?.data?.data || [];

  const deleteMutation = useMutation<any, any, string>({
    mutationFn: (id: string) => listingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      toast.success('Listing deleted successfully');
      setDeleteId(null);
    },
    onError: (err: Error) => {
      const axiosErr = err as unknown as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to delete listing');
      setDeleteId(null);
    },
  });

  const openCreate = () => {
    setEditingListing(null);
    setModalOpen(true);
  };

  const openEdit = (listing: Listing) => {
    setEditingListing(listing);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-48" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load listings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SeoHead title="My Listings" noindex />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" /> Create New Listing
        </button>
      </div>

      {listings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FiPlus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first listing.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" /> Create Listing
          </button>
        </div>
      )}

      {listings.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Rating</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing: Listing) => (
                    <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{listing.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{typeof listing.category === 'object' ? listing.category?.name : listing.category || '—'}</td>
                      <td className="px-4 py-3">{statusBadge(listing.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <FiStar className="w-4 h-4 text-[#F4B400] fill-current" />
                          <span>{listing.averageRating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(listing.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(listing)}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(listing.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4">
            {listings.map((listing: Listing) => (
              <div key={listing.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{listing.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {typeof listing.category === 'object' ? listing.category?.name : listing.category || '—'}
                    </p>
                  </div>
                  {statusBadge(listing.status)}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-[#F4B400] fill-current" />
                    <span className="font-medium text-gray-900">{listing.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(listing)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(listing.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <ListingFormModal
          isOpen={modalOpen}
          onClose={() => { setModalOpen(false); setEditingListing(null); }}
          listing={editingListing}
          categories={categories}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Listing</h3>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this listing? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
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

export default ProviderListings;
