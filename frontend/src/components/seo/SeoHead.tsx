import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Maliquez Connect';
const DEFAULT_DESC = 'Discover and compare top-rated service providers across Education, Healthcare, Hospitality, and Logistics. Make confident decisions with verified reviews and smart comparisons.';
const DEFAULT_IMAGE = 'https://maliquez.com/og-image.png';
const BASE_URL = 'https://maliquez.com';

interface SeoHeadProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  publishedTime?: string;
  author?: string;
}

const SeoHead = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  publishedTime,
  author,
}: SeoHeadProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = canonical ? `${BASE_URL}${canonical}` : BASE_URL;
  const ogImage = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {author && <meta name="author" content={author} />}
    </Helmet>
  );
};

export default SeoHead;
