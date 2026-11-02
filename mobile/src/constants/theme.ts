/**
 * Design tokens for the Maliquez Connect provider app.
 * Colors are defined for light and dark mode. Spacing, radius and shadows
 * follow a small, consistent scale so every screen feels like one product.
 */

import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    text: '#1A1A1E',
    background: '#F7F7F9',
    surface: '#FFFFFF',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EFE6F0',
    textSecondary: '#6B6F76',
    border: '#ECECF0',
  },
  dark: {
    text: '#F4F4F6',
    background: '#0C0C0E',
    surface: '#1A1A1E',
    backgroundElement: '#1A1A1E',
    backgroundSelected: '#2A1A26',
    textSecondary: '#9A9EA6',
    border: '#2A2A30',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  sans: 'normal',
  serif: 'serif',
  rounded: 'normal',
  mono: 'monospace',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
} as const;

export const Shadows = {
  light: {
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  dark: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const;

export const Brand = {
  main: '#7A1F5C',
  dark: '#611547',
  accent: '#C15A9D',
  highlight: '#D8B4D1',
  white: '#FFFFFF',
  tint: '#F7EEF3',
} as const;

export const BottomTabInset = 80;
export const MaxContentWidth = 800;

export function useShadow() {
  const scheme = useColorScheme();
  return Shadows[scheme === 'dark' ? 'dark' : 'light'];
}
