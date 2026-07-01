/**
 * FarmsEasy / PCFMS color palette.
 *
 * Two-level structure:
 *  1. Raw scale  — concrete hex values (orange.500, green.900 …)
 *  2. Semantic   — role-based aliases consumed by components (primary, surface …)
 *
 * UI reference (June 2026):
 *   - Headers, nav bars, CTA buttons → brandGreen (#1B3D1B)
 *   - Brand identity / logo          → brandOrange (#E67E22)   [PHASES.md "primary"]
 *   - Payment / financial CTAs       → amber (#F9A825)
 *   - Mortality / error / logout     → red (#D32F2F)
 */

// ─── Raw scale ────────────────────────────────────────────────────────────────

export const palette = {
  // Brand orange — PHASES.md primary, logo accent
  orange: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#E67E22', // ← PHASES.md `primary`
    600: '#D4690A',
    700: '#BF560A',
    800: '#A84300',
    900: '#8B3300',
  },

  // Brand green — UI primary for headers, nav, CTA buttons
  green: {
    50: '#F1F8E9',
    100: '#DCEDC8',
    200: '#C5E1A5',
    300: '#AED581',
    400: '#9CCC65',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32', // ← PHASES.md `secondary`
    850: '#1E5E22',
    900: '#1B3D1B', // ← header / nav / primary button color
    950: '#122812',
  },

  // Amber — payment CTAs, TRIAL status, warnings
  amber: {
    50: '#FFF8E1',
    100: '#FFECB3',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#F9A825',
    600: '#F57F17',
    700: '#E65100',
  },

  // Red — mortality, error, danger, logout
  red: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    300: '#EF9A9A',
    500: '#EF5350',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Blue — SAAS_ADMIN role badge
  blue: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Purple — FARMER role badge
  purple: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    700: '#7B1FA2',
    800: '#6A1B9A',
  },

  // Neutral
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    150: '#F0F0F0',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#121212',
    1000: '#000000',
  },
} as const;

// ─── Semantic aliases ──────────────────────────────────────────────────────────

export const semanticColors = {
  // Interactive / brand
  primary: palette.green[900], // #1B3D1B — headers, nav, primary buttons
  primaryHover: palette.green[800],
  primaryLight: palette.green[500],
  primaryContainer: palette.green[50], // #F1F8E9 — input focus bg, chip bg

  brand: palette.orange[500], // #E67E22 — logo, brand accent
  brandContainer: palette.orange[50],

  secondary: palette.green[800], // #2E7D32 — secondary actions, badges
  secondaryContainer: palette.green[100],

  // Financial / payment
  financial: palette.amber[500], // #F9A825 — "Make Payment" button
  financialContainer: palette.amber[50],

  // Semantic
  success: palette.green[700],
  successContainer: palette.green[50],
  warning: palette.amber[500],
  warningContainer: palette.amber[50],
  error: palette.red[700], // #D32F2F — mortality, errors, logout
  errorContainer: palette.red[50],
  info: palette.blue[700],
  infoContainer: palette.blue[50],

  // Surface / background
  background: '#F7F9F7', // very slight green tint on white
  surface: palette.neutral[0],
  surfaceElevated: palette.neutral[50],
  surfaceVariant: '#F0F7F0',

  // Text
  textPrimary: palette.neutral[900],
  textSecondary: palette.neutral[600],
  textDisabled: palette.neutral[400],
  textOnPrimary: palette.neutral[0], // white on green buttons
  textOnBrand: palette.neutral[0],

  // Border / divider
  border: palette.neutral[300],
  borderStrong: palette.neutral[400],
  borderFocus: palette.green[900],

  // Status badge colors
  statusActive: { text: palette.green[800], bg: palette.green[50] },
  statusInactive: { text: palette.neutral[600], bg: palette.neutral[100] },
  statusSuspended: { text: palette.red[700], bg: palette.red[50] },
  statusTrial: { text: palette.amber[600], bg: palette.amber[50] },
  statusExpired: { text: palette.red[700], bg: palette.red[50] },
  statusPending: { text: palette.amber[600], bg: palette.amber[50] },
  statusPaid: { text: palette.green[800], bg: palette.green[50] },

  // Dark mode overrides (used in darkTokens.ts)
  dark: {
    background: '#121612',
    surface: '#1E241E',
    surfaceElevated: '#252E25',
    surfaceVariant: '#2A342A',
    textPrimary: '#E4EEE4',
    textSecondary: '#A0B8A0',
    textDisabled: '#4A5E4A',
    border: '#3A4A3A',
    borderStrong: '#4A5E4A',
    primary: '#81C784',
    primaryContainer: '#1B3D1B',
    error: '#EF9A9A',
    errorContainer: '#B71C1C',
  },
} as const;

export type SemanticColor = keyof typeof semanticColors;
