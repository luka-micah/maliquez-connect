import { Helmet } from 'react-helmet-async';

interface OrganizationJsonLdProps {
  name: string;
  description?: string;
  url?: string;
  logo?: string;
  sameAs?: string[];
}

interface LocalBusinessJsonLdProps {
  name: string;
  description: string;
  image?: string;
  url?: string;
  telephone?: string;
  address?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    addressCountry?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
  };
  priceRange?: string;
}

interface CollectionPageJsonLdProps {
  name: string;
  description?: string;
  url?: string;
}

export const OrganizationJsonLd = ({
  name,
  description,
  url = 'https://maliquez.com',
  logo,
  sameAs = [],
}: OrganizationJsonLdProps) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    ...(description && { description }),
    url,
    ...(logo && { logo }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export const LocalBusinessJsonLd = ({
  name,
  description,
  image,
  url,
  telephone,
  address,
  aggregateRating,
  priceRange,
}: LocalBusinessJsonLdProps) => {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    description,
    ...(image && { image }),
    ...(url && { url }),
    ...(telephone && { telephone }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...address,
      },
    }),
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
      },
    }),
    ...(priceRange && { priceRange }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export const CollectionPageJsonLd = ({
  name,
  description,
  url,
}: CollectionPageJsonLdProps) => {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    ...(description && { description }),
    ...(url && { url }),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: { name: string; url: string }[];
}) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};
