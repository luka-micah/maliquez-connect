export const SECTORS = [
  { label: 'Education', value: 'EDUCATION' },
  { label: 'Healthcare', value: 'HEALTHCARE' },
  { label: 'Hospitality', value: 'HOSPITALITY' },
  { label: 'Logistics', value: 'LOGISTICS' },
] as const;

export const SECTOR_LABELS: Record<string, string> = {
  EDUCATION: 'Education',
  HEALTHCARE: 'Healthcare',
  HOSPITALITY: 'Hospitality',
  LOGISTICS: 'Logistics',
};

export const LISTING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
};

export const VERIFICATION_LABELS: Record<string, string> = {
  VERIFIED: 'Verified',
  UNVERIFIED: 'Unverified',
  PENDING: 'Pending',
};
