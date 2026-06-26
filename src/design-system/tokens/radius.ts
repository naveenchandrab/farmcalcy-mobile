/**
 * Border radius tokens.
 *
 * UI reference observation: the app uses consistently rounded corners —
 * cards at `lg` (12dp), buttons at `md` (8dp), badges at `full`.
 */
export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radius;
