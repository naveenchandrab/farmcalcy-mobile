/**
 * Compiled theme token sets — one for light, one for dark.
 * Components consume these through `useTheme()`, never importing raw palette values.
 */
import { semanticColors } from '../tokens/colors';
import { radius } from '../tokens/radius';
import { shadows } from '../tokens/shadows';
import { spacing, layout } from '../tokens/spacing';
import { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight, textPresets } from '../tokens/typography';
import { zIndex } from '../tokens/zIndex';

const sharedTokens = {
  font: { family: fontFamily, size: fontSize, weight: fontWeight, lineHeight, letterSpacing },
  text: textPresets,
  spacing,
  layout,
  radius,
  shadows,
  zIndex,
} as const;

export const lightTokens = {
  ...sharedTokens,
  isDark: false,
  colors: {
    // Interactive
    primary: semanticColors.primary,
    primaryHover: semanticColors.primaryHover,
    primaryLight: semanticColors.primaryLight,
    primaryContainer: semanticColors.primaryContainer,
    brand: semanticColors.brand,
    brandContainer: semanticColors.brandContainer,
    secondary: semanticColors.secondary,
    secondaryContainer: semanticColors.secondaryContainer,
    financial: semanticColors.financial,
    financialContainer: semanticColors.financialContainer,
    // Semantic
    success: semanticColors.success,
    successContainer: semanticColors.successContainer,
    warning: semanticColors.warning,
    warningContainer: semanticColors.warningContainer,
    error: semanticColors.error,
    errorContainer: semanticColors.errorContainer,
    info: semanticColors.info,
    infoContainer: semanticColors.infoContainer,
    // Surface
    background: semanticColors.background,
    surface: semanticColors.surface,
    surfaceElevated: semanticColors.surfaceElevated,
    surfaceVariant: semanticColors.surfaceVariant,
    // Text
    textPrimary: semanticColors.textPrimary,
    textSecondary: semanticColors.textSecondary,
    textDisabled: semanticColors.textDisabled,
    onPrimary: '#FFFFFF',
    textOnPrimary: semanticColors.textOnPrimary,
    textOnBrand: semanticColors.textOnBrand,
    // Border
    border: semanticColors.border,
    borderStrong: semanticColors.borderStrong,
    borderFocus: semanticColors.borderFocus,
    // Status
    status: {
      active: semanticColors.statusActive,
      inactive: semanticColors.statusInactive,
      suspended: semanticColors.statusSuspended,
      trial: semanticColors.statusTrial,
      expired: semanticColors.statusExpired,
      pending: semanticColors.statusPending,
      paid: semanticColors.statusPaid,
    },
  },
} as const;

export const darkTokens = {
  ...sharedTokens,
  isDark: true,
  colors: {
    primary: semanticColors.dark.primary,
    primaryHover: '#6DBF71',
    primaryLight: '#A5D6A7',
    primaryContainer: semanticColors.dark.primaryContainer,
    brand: semanticColors.brand,
    brandContainer: semanticColors.brandContainer,
    secondary: '#A5D6A7',
    secondaryContainer: '#1B3D1B',
    financial: '#FFD54F',
    financialContainer: '#4A3800',
    success: '#81C784',
    successContainer: '#1B3D1B',
    warning: '#FFD54F',
    warningContainer: '#4A3800',
    error: semanticColors.dark.error,
    errorContainer: semanticColors.dark.errorContainer,
    info: '#64B5F6',
    infoContainer: '#0D2744',
    background: semanticColors.dark.background,
    surface: semanticColors.dark.surface,
    surfaceElevated: semanticColors.dark.surfaceElevated,
    surfaceVariant: semanticColors.dark.surfaceVariant,
    textPrimary: semanticColors.dark.textPrimary,
    textSecondary: semanticColors.dark.textSecondary,
    textDisabled: semanticColors.dark.textDisabled,
    onPrimary: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
    textOnBrand: '#FFFFFF',
    border: semanticColors.dark.border,
    borderStrong: semanticColors.dark.borderStrong,
    borderFocus: '#81C784',
    status: {
      active: { text: '#81C784', bg: '#1B3D1B' },
      inactive: { text: '#9E9E9E', bg: '#2A2A2A' },
      suspended: { text: '#EF9A9A', bg: '#4A1515' },
      trial: { text: '#FFD54F', bg: '#4A3800' },
      expired: { text: '#EF9A9A', bg: '#4A1515' },
      pending: { text: '#FFD54F', bg: '#4A3800' },
      paid: { text: '#81C784', bg: '#1B3D1B' },
    },
  },
} as const;

export type Theme = Omit<typeof lightTokens, 'isDark'> & { isDark: boolean };
export type ThemeColors = typeof lightTokens.colors;
