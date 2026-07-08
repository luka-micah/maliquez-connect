import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://maliquez.com';
const API_BASE = process.env.VITE_API_BASE_URL || '/api/v1';
const API_HOST = process.env.API_HOST || 'http://localhost:4000';
const API_URL = `${API_HOST}${API_BASE}`;

interface Category {
  id: string;
  name: string;
  slug?: string;
  updatedAt: string;
}

interface Listing {
  id: string;
  title: string;
  slug?: string;
  updatedAt: string;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    total: number;
    totalPages: number;
    page: number;
  };
}

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
};

const fetchAllPages = async <T>(
  baseUrl: string,
  limit = 100
): Promise<T[]> => {
  const results: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${baseUrl}?page=${page}&limit=${limit}&status=APPROVED`;
    const data = await fetchJson<PaginatedResponse<T[]>>(url);

    if (!data?.data) break;

    results.push(...data.data);

    const pagination = data.pagination;
    if (pagination && page < pagination.totalPages) {
      page++;
    } else {
      hasMore = false;
    }
  }

  return results;
};

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const generateSitemap = async () => {
  const urls: string[] = [];

  const now = new Date().toISOString().split('T')[0];

  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/about', priority: '0.5', changefreq: 'monthly' },
    { loc: '/search', priority: '0.8', changefreq: 'daily' },
    { loc: '/categories', priority: '0.8', changefreq: 'weekly' },
    { loc: '/compare', priority: '0.6', changefreq: 'monthly' },
  ];

  for (const page of staticPages) {
    urls.push(`  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`);
  }

  // Categories
  const categories = await fetchAllPages<Category>(`${API_URL}/categories`);
  for (const cat of categories) {
    const slug = cat.slug || slugify(cat.name);
    urls.push(`  <url>
    <loc>${BASE_URL}/categories/${escapeXml(slug)}</loc>
    <lastmod>${cat.updatedAt ? cat.updatedAt.split('T')[0] : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  }

  // Approved listings
  const listings = await fetchAllPages<Listing>(`${API_URL}/listings`);
  for (const listing of listings) {
    const slug = listing.slug || slugify(listing.title);
    urls.push(`  <url>
    <loc>${BASE_URL}/listings/${escapeXml(slug)}</loc>
    <lastmod>${listing.updatedAt ? listing.updatedAt.split('T')[0] : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  const outPath = resolve(process.cwd(), 'public', 'sitemap.xml');
  writeFileSync(outPath, sitemap, 'utf-8');
  console.log(`Sitemap generated: ${outPath} (${urls.length} URLs)`);
};

generateSitemap().catch((err) => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
