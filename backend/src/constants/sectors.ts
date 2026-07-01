export const SECTORS = {
  EDUCATION: 'Education',
  HEALTHCARE: 'Healthcare',
  HOSPITALITY: 'Hospitality',
  LOGISTICS: 'Logistics',
} as const;

export type Sector = (typeof SECTORS)[keyof typeof SECTORS];

export const SECTOR_LIST: string[] = Object.values(SECTORS);
