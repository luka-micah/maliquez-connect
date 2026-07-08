type WindowWithDataLayer = Window & {
  dataLayer?: Record<string, unknown>[];
};

declare const window: WindowWithDataLayer;

const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;

const getDataLayer = (): Record<string, unknown>[] => {
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  return window.dataLayer;
};

export const trackPageView = (url?: string): void => {
  if (!GTM_ID) return;

  getDataLayer().push({
    event: 'page_view',
    page: url || window.location.pathname + window.location.search,
    title: document.title,
  });
};

export const trackEvent = (
  eventName: string,
  payload?: Record<string, unknown>
): void => {
  if (!GTM_ID) return;

  getDataLayer().push({
    event: eventName,
    ...payload,
  });
};

export const trackSearch = (query: string, resultsCount?: number): void => {
  getDataLayer().push({
    event: 'search',
    search_term: query,
    ...(resultsCount !== undefined && { results_count: resultsCount }),
  });
};

export const trackCategoryView = (categoryId: string, categoryName: string): void => {
  getDataLayer().push({
    event: 'view_category',
    category_id: categoryId,
    category_name: categoryName,
  });
};

export const trackListingView = (listing: {
  id: string;
  title: string;
  category?: string;
  sector?: string;
}): void => {
  getDataLayer().push({
    event: 'view_item',
    item_id: listing.id,
    item_name: listing.title,
    item_category: listing.category,
    item_sector: listing.sector,
  });
};

export const trackLogin = (method: 'email' | 'google' | 'facebook' = 'email'): void => {
  getDataLayer().push({
    event: 'login',
    method,
  });
};

export const trackRegister = (method: 'email' | 'google' | 'facebook' = 'email', role?: string): void => {
  getDataLayer().push({
    event: 'sign_up',
    method,
    ...(role && { role }),
  });
};

export const trackFavorite = (listingId: string, listingTitle: string, action: 'add' | 'remove'): void => {
  getDataLayer().push({
    event: action === 'add' ? 'add_to_wishlist' : 'remove_from_wishlist',
    item_id: listingId,
    item_name: listingTitle,
  });
};

export const trackComparison = (listingIds: string[], action: 'add' | 'remove' | 'view'): void => {
  getDataLayer().push({
    event: 'comparison',
    action,
    item_ids: listingIds,
  });
};

export const trackContactBusiness = (listingId: string, listingTitle: string, contactMethod: string): void => {
  getDataLayer().push({
    event: 'contact_business',
    item_id: listingId,
    item_name: listingTitle,
    contact_method: contactMethod,
  });
};
