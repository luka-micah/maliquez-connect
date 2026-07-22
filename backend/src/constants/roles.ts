export const ROLES = {
  USER: 'USER' as const,
  PROVIDER: 'PROVIDER' as const,
  AGENT: 'AGENT' as const,
  ADMIN: 'ADMIN' as const,
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<string, number> = {
  USER: 1,
  PROVIDER: 2,
  AGENT: 3,
  ADMIN: 4,
};
