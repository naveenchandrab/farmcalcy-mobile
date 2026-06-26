import { useTheme } from '@design-system';
import type { Theme } from '@design-system';
import { useThemeStore } from '@store/themeStore';
import type { ActiveTheme, ThemeMode } from '@app-types';

interface UseAppThemeReturn {
  theme: Theme;
  activeTheme: ActiveTheme;
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

export const useAppTheme = (): UseAppThemeReturn => {
  const theme = useTheme();
  const { mode, getActiveTheme, toggleTheme, setTheme } = useThemeStore();
  const activeTheme = getActiveTheme();

  return {
    theme,
    activeTheme,
    mode,
    isDark: activeTheme === 'dark',
    toggleTheme,
    setTheme,
  };
};
