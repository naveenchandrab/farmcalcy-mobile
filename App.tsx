import { NavigationContainer ,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Appearance } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { apiClient } from '@api/axios';
import { setupInterceptors } from '@api/interceptors';
import { ThemeProvider, useTheme , ToastProvider, ToastBridge } from '@design-system';
import { queryClient } from '@services/queryClient';
import { useThemeStore } from '@store/themeStore';

// Attach interceptors once — before the first render that might trigger an API call.
setupInterceptors(apiClient);

/**
 * Provider order (outer → inner):
 *  1. GestureHandlerRootView  — required by react-navigation/gesture-handler
 *  2. SafeAreaProvider        — safe area insets for notches/home indicators
 *  3. QueryClientProvider     — TanStack Query cache
 *  4. ThemeProvider           — custom design system theme (replaces PaperProvider)
 *  5. ToastProvider           — imperative toast API
 *  6. NavigationContainer     — navigation state + linking
 *
 * ToastBridge is mounted inside ToastProvider to wire the module-level ref.
 */
const App: React.FC = () => {
  const mode = useThemeStore(state => state.mode);
  const setTheme = useThemeStore(state => state.setTheme);

  // Keep the store in sync when the OS theme changes and mode = 'system'
  useEffect(() => {
    if (mode !== 'system') {
      return;
    }
    const subscription = Appearance.addChangeListener(() => {
      setTheme('system');
    });
    return () => subscription.remove();
  }, [mode, setTheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ToastProvider>
              <ToastBridge />
              <NavigationInner />
            </ToastProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

/**
 * Separated so that useTheme() can be called after ThemeProvider mounts.
 * Computes the NavigationContainer theme colours from DS tokens.
 */
const NavigationInner: React.FC = () => {
  const { colors, isDark } = useTheme();

  const navigationTheme = isDark
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
      }
    : {
        ...NavigationLightTheme,
        colors: {
          ...NavigationLightTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.error,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigatorLazy />
    </NavigationContainer>
  );
};

// Lazy-load the navigator tree so the JS engine parses it after the first frame
const RootNavigator = React.lazy(() => import('@navigation'));
const RootNavigatorLazy: React.FC = () => (
  <React.Suspense fallback={null}>
    <RootNavigator />
  </React.Suspense>
);

export default App;
