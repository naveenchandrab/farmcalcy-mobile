import { MD3LightTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

import { Colors } from './colors';

/**
 * FarmCalcy light theme — matched to the UI reference (June 2025).
 *
 * Brand identity: PCFMS / Poultry Contract Farming Management System
 *
 * Primary  → #1B3D1B  deep forest green (headers, nav bar, CTA buttons)
 * Secondary → #2E7D32  medium green (secondary actions, badges, icons)
 * Tertiary  → #F9A825  amber (payment CTAs, financial highlights, warnings)
 * Error     → #D32F2F  red (mortality counts, danger states, logout)
 *
 * Typography scale and spacing follow MD3 defaults. roundness = 2 (6 dp)
 * gives the slightly-rounded-but-professional look visible in the UI cards.
 */
export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 2,
  colors: {
    ...MD3LightTheme.colors,

    // ─── Primary — deep forest green ────────────────────────────────────────
    primary: Colors.brandDark,          // #1B3D1B — headers, primary buttons
    onPrimary: Colors.white,
    primaryContainer: Colors.brandSurface, // #E8F5E9
    onPrimaryContainer: Colors.brandDark,

    // ─── Secondary — medium green ───────────────────────────────────────────
    secondary: Colors.brandMid,          // #2E7D32
    onSecondary: Colors.white,
    secondaryContainer: Colors.brandSubtle, // #F1F8E9
    onSecondaryContainer: Colors.brandDark,

    // ─── Tertiary — amber (financial / payment actions) ─────────────────────
    tertiary: Colors.amber,             // #F9A825
    onTertiary: Colors.white,
    tertiaryContainer: Colors.amberLight, // #FFF8E1
    onTertiaryContainer: Colors.amberDark,

    // ─── Error — red (mortality counts, danger, logout) ─────────────────────
    error: Colors.danger,               // #D32F2F
    onError: Colors.white,
    errorContainer: Colors.dangerLight, // #FFEBEE
    onErrorContainer: Colors.dangerDark,

    // ─── Background / Surface ────────────────────────────────────────────────
    background: Colors.background,      // #F7F9F7 — slight green tint on white
    onBackground: Colors.textPrimary,
    surface: Colors.surface,            // #FFFFFF — cards, modals
    onSurface: Colors.textPrimary,
    surfaceVariant: Colors.brandSurface, // #E8F5E9 — input fields, chips
    onSurfaceVariant: Colors.textSecondary,
    surfaceDisabled: 'rgba(27, 61, 27, 0.12)',
    onSurfaceDisabled: 'rgba(27, 61, 27, 0.38)',

    // ─── Outline ─────────────────────────────────────────────────────────────
    outline: Colors.border,             // #E0E0E0
    outlineVariant: '#C8E6C9',

    // ─── Inverse (snack bars, overlays) ─────────────────────────────────────
    inverseSurface: '#1E241E',
    inverseOnSurface: '#E8F5E9',
    inversePrimary: Colors.brandLight,  // #4CAF50

    // ─── Shadow / Scrim ──────────────────────────────────────────────────────
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(27, 61, 27, 0.4)',

    // ─── Tonal elevation surfaces ─────────────────────────────────────────────
    elevation: {
      level0: 'transparent',
      level1: '#F0F7F0',   // surface + 5% primary tint
      level2: '#EAF3EA',
      level3: '#E4F0E4',
      level4: '#E2EEE2',
      level5: '#DCEBDC',
    },
  },
};
