import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ActiveTheme, ThemeMode } from '@app-types';
import { STORAGE_KEY_THEME } from '@constants';

interface ThemeState {
  /** User's explicit preference, or 'system' to follow OS setting. */
  mode: ThemeMode;

  /** Resolves the active theme by honouring system preference when mode = 'system'. */
  getActiveTheme: () => ActiveTheme;

  /** Cycle between light → dark → system. */
  toggleTheme: () => void;

  /** Explicitly set a theme mode. */
  setTheme: (mode: ThemeMode) => void;
}

const resolveSystemTheme = (): ActiveTheme => {
  const systemScheme = Appearance.getColorScheme();
  return systemScheme === 'dark' ? 'dark' : 'light';
};

const TOGGLE_CYCLE: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

/**
 * Persists the user's theme preference to AsyncStorage so it survives
 * app restarts. The `mode` field is stored; the derived `activeTheme`
 * is computed at runtime so it always reflects the current OS setting.
 *
 * For higher performance, swap AsyncStorage for MMKV:
 *   import { MMKV } from 'react-native-mmkv';
 *   const mmkv = new MMKV();
 *   createJSONStorage(() => ({ getItem: k => mmkv.getString(k) ?? null, ... }))
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',

      getActiveTheme: (): ActiveTheme => {
        const { mode } = get();
        if (mode === 'system') {
          return resolveSystemTheme();
        }
        return mode;
      },

      toggleTheme: () => {
        set(state => ({ mode: TOGGLE_CYCLE[state.mode] }));
      },

      setTheme: (mode: ThemeMode) => {
        set({ mode });
      },
    }),
    {
      name: STORAGE_KEY_THEME,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ mode: state.mode }), // only persist the mode field
    },
  ),
);
