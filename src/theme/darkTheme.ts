import { MD3DarkTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

import { Colors } from './colors';

/**
 * FarmCalcy dark theme — matched to the UI reference (June 2025).
 *
 * Green primary colours are lightened to meet WCAG AA (4.5:1) contrast
 * ratios on dark surfaces. Amber and red retain their identity
 * but are shifted lighter so they remain readable.
 */
export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 2,
  colors: {
    ...MD3DarkTheme.colors,

    // ─── Primary — lightened forest green for dark surfaces ──────────────────
    primary: '#81C784',            // Green 300 — meets AA on dark bg
    onPrimary: '#003314',
    primaryContainer: '#1B3D1B',   // brand dark — container on dark surface
    onPrimaryContainer: '#B8F0B8',

    // ─── Secondary ───────────────────────────────────────────────────────────
    secondary: '#A5D6A7',          // Green 200
    onSecondary: '#003314',
    secondaryContainer: '#1E331E',
    onSecondaryContainer: '#C8E6C9',

    // ─── Tertiary — amber ─────────────────────────────────────────────────────
    tertiary: '#FFD54F',           // Amber 300 — payment CTA on dark bg
    onTertiary: '#3A2800',
    tertiaryContainer: '#4A3800',
    onTertiaryContainer: '#FFF8E1',

    // ─── Error — lightened red ────────────────────────────────────────────────
    error: '#EF9A9A',              // Red 200 — mortality on dark bg
    onError: '#7F0000',
    errorContainer: '#B71C1C',
    onErrorContainer: '#FFCDD2',

    // ─── Background / Surface ────────────────────────────────────────────────
    background: Colors.darkBackground,   // #121612 — very dark with green undertone
    onBackground: '#E4EEE4',
    surface: Colors.darkSurface,         // #1E241E — cards, modals
    onSurface: '#E4EEE4',
    surfaceVariant: Colors.darkSurfaceVariant, // #2A342A — input fields
    onSurfaceVariant: '#B0C8B0',
    surfaceDisabled: 'rgba(129, 199, 132, 0.12)',
    onSurfaceDisabled: 'rgba(129, 199, 132, 0.38)',

    // ─── Outline ─────────────────────────────────────────────────────────────
    outline: Colors.darkBorder,         // #3A4A3A
    outlineVariant: '#2A3A2A',

    // ─── Inverse ─────────────────────────────────────────────────────────────
    inverseSurface: '#E4EEE4',
    inverseOnSurface: '#1E241E',
    inversePrimary: Colors.brandDark,   // #1B3D1B

    // ─── Shadow / Scrim ──────────────────────────────────────────────────────
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 51, 20, 0.5)',

    // ─── Tonal elevation surfaces ─────────────────────────────────────────────
    elevation: {
      level0: 'transparent',
      level1: '#1E271E',
      level2: '#202B20',
      level3: '#233023',
      level4: '#243124',
      level5: '#263626',
    },
  },
};
