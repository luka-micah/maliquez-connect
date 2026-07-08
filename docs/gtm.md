# Google Tag Manager

## Initialization

GTM is loaded in `frontend/index.html` via the standard container snippet. The container ID is injected at build time from the `VITE_GTM_ID` environment variable (Vite's `%VITE_GTM_ID%` syntax).

- **`.env`** — `VITE_GTM_ID=GTM-5Q8WCQNL`
- **`index.html`** — The snippet is placed as high as possible in `<head>` and the noscript iframe immediately after `<body>`. Vite replaces `%VITE_GTM_ID%` with the actual value during `vite build`.

No JavaScript-based initialization is needed — the snippet handles it. The `dataLayer` array is created by the snippet; the `gtm.ts` utility lazily accesses it via `window.dataLayer`.

## SPA Page Views

`frontend/src/components/analytics/GTMProvider.tsx` wraps the app inside `<BrowserRouter>` and listens to `useLocation()`. On every route change (skipping the initial render to avoid duplicate tracking), it calls `trackPageView()` which pushes a `page_view` event to `dataLayer`.

This ensures Google Analytics (configured inside GTM) receives proper pageviews for client-side navigation behind Vercel/Cloudflare.

## Creating New Events

All tracking helpers are in `frontend/src/utils/gtm.ts`.

### Generic event

```ts
import { trackEvent } from '../../utils/gtm';

trackEvent('custom_event', { key: 'value' });
```

### Built-in helpers

```ts
trackSearch(query, resultsCount?)
trackCategoryView(categoryId, categoryName)
trackListingView({ id, title, category?, sector? })
trackLogin(method?)              // 'email' | 'google' | 'facebook'
trackRegister(method?, role?)    // 'email' | 'google' | 'facebook'
trackFavorite(listingId, title, action)   // 'add' | 'remove'
trackComparison(listingIds, action)       // 'add' | 'remove' | 'view'
trackContactBusiness(listingId, title, method)
```

To add a new event type:

1. Add a new exported function in `gtm.ts` following the existing pattern
2. Call `getDataLayer().push({ event: 'event_name', ...data })`
3. In GTM's web interface, create a new tag triggered by the custom event name

## Testing with Google Tag Assistant

1. **Build the project** — `npm run build && npm run preview` (or deploy to a staging URL)
2. **Install Tag Assistant** — Get the [Google Tag Assistant](https://tagassistant.google.com/) Chrome extension
3. **Record a session** — Open the extension, click "Add domain", enter `https://maliquez.com` (or your URL), and start recording
4. **Navigate** — Browse the site and trigger events (search, view listing, login, etc.)
5. **Verify** — Tag Assistant will show:
   - GTM container loaded (`GTM-5Q8WCQNL`)
   - Each `page_view` event on route changes
   - Custom events (`search`, `view_item`, `login`, etc.) when you call the helpers
6. **Check `dataLayer`** — In DevTools Console, type `window.dataLayer` to inspect all pushed events

### Common issues

| Symptom | Likely cause |
|---|---|
| No GTM loaded | `VITE_GTM_ID` not set or build didn't replace `%VITE_GTM_ID%` |
| Duplicate page views | Multiple `GTMProvider` instances or missing skip-first-render logic |
| Custom event not firing | Function guard `if (!GTM_ID)` returning early — verify env var |
| Events in dev but not prod | Vite dev server doesn't replace `%VITE_GTM_ID%` in `index.html`; run `npm run build && npm run preview` to test production build |
