/**
 * Typography tokens.
 *
 * Font family: system default (no custom font install in Phase 1).
 * Switch to 'Inter' by adding react-native-google-fonts in a future phase.
 *
 * Size scale follows a 4pt base with a t-shirt naming convention.
 * All sizes are in sp (scale-independent pixels), which RN handles correctly.
 */
import { Platform } from 'react-native';

export const fontFamily = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

export const fontSize = {
  '2xs': 10,
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 30,
  '5xl': 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1.0,
  widest: 2.0,
} as const;

/**
 * Pre-composed text style presets — used by the Typography component.
 * Each preset is a complete set of text style props.
 */
export const textPresets = {
  /** Screen titles, hero headings */
  displayLg: {
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['4xl'] * lineHeight.tight,
    letterSpacing: letterSpacing.tight,
  },
  displayMd: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['3xl'] * lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  /** Section headings */
  headingLg: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    lineHeight: fontSize['2xl'] * lineHeight.snug,
    letterSpacing: letterSpacing.tight,
  },
  headingMd: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.xl * lineHeight.snug,
  },
  headingSm: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.lg * lineHeight.snug,
  },
  /** Body / paragraph text */
  bodyLg: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.lg * lineHeight.normal,
  },
  bodyMd: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * lineHeight.normal,
  },
  bodySm: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.sm * lineHeight.normal,
  },
  /** Labels — UI controls, form labels */
  labelLg: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.md * lineHeight.snug,
    letterSpacing: letterSpacing.wide,
  },
  labelMd: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: fontSize.sm * lineHeight.snug,
    letterSpacing: letterSpacing.wide,
  },
  labelSm: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semiBold,
    lineHeight: fontSize.xs * lineHeight.snug,
    letterSpacing: letterSpacing.wider,
  },
  /** Captions — helper text, timestamps */
  caption: {
    fontSize: fontSize['2xs'],
    fontWeight: fontWeight.regular,
    lineHeight: fontSize['2xs'] * lineHeight.normal,
    letterSpacing: letterSpacing.wide,
  },
} as const;

export type TextPreset = keyof typeof textPresets;
