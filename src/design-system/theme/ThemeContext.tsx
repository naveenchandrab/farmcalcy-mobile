import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useThemeStore } from '@store/themeStore';
import { darkTokens, lightTokens } from './tokens';
import type { Theme } from './tokens';

const ThemeContext = createContext<Theme>(lightTokens);

/**
 * ThemeProvider — wraps the entire app and provides the active token set
 * via React Context. Reads the user preference from ThemeStore (Zustand)
 * and falls back to the OS color scheme when the mode is 'system'.
 *
 * Place this inside QueryClientProvider and above NavigationContainer.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mode = useThemeStore(state => state.mode);
  const systemScheme = useColorScheme();

  const theme = useMemo<Theme>(() => {
    const t =
      mode === 'dark'
        ? darkTokens
        : mode === 'light'
        ? lightTokens
        : systemScheme === 'dark'
        ? darkTokens
        : lightTokens;
    return t as Theme;
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

/**
 * useTheme — typed access to the active design token set.
 *
 * Usage:
 *   const { colors, spacing, radius, shadows } = useTheme();
 *   <View style={{ backgroundColor: colors.surface, padding: spacing[4] }} />
 */
export const useTheme = (): Theme => useContext(ThemeContext);
