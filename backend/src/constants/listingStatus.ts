export const LISTING_STATUS = {
  PENDING: 'PENDING' as const,
  APPROVED: 'APPROVED' as const,
  SUSPENDED: 'SUSPENDED' as const,
  REJECTED: 'REJECTED' as const,
} as const;

export const REVIEW_STATUS = {
  PENDING: 'PENDING' as const,
  APPROVED: 'APPROVED' as const,
  REJECTED: 'REJECTED' as const,
} as const;

export const VERIFICATION_STATUS = {
  UNVERIFIED: 'UNVERIFIED' as const,
  VERIFIED: 'VERIFIED' as const,
  PENDING: 'PENDING' as const,
} as const;
