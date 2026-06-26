/**
 * Shadow / elevation tokens.
 *
 * Each level provides both iOS shadow props and Android `elevation`.
 * Import and spread onto a View's style to apply the shadow.
 *
 * Usage:
 *   <View style={[styles.card, shadows.sm]} />
 */
import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

const buildShadow = (
  yOffset: number,
  blur: number,
  opacity: number,
  elevation: number,
): Shadow => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: yOffset },
  shadowOpacity: Platform.OS === 'ios' ? opacity : 0,
  shadowRadius: Platform.OS === 'ios' ? blur : 0,
  elevation,
});

export const shadows = {
  /** No shadow */
  none: {} as ViewStyle,
  /** Hairline — tab bar, app bar divider */
  xs: buildShadow(1, 2, 0.04, 1),
  /** Card default */
  sm: buildShadow(2, 4, 0.06, 2),
  /** Card hover / active card */
  md: buildShadow(4, 8, 0.08, 4),
  /** Floating action button */
  lg: buildShadow(6, 12, 0.10, 6),
  /** Modal, bottom sheet */
  xl: buildShadow(8, 16, 0.14, 8),
  /** Overlay elements */
  '2xl': buildShadow(16, 24, 0.18, 16),
} as const;

export type ShadowKey = keyof typeof shadows;
