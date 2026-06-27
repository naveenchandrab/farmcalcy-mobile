import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Suspense } from 'react';
import { useShallow } from 'zustand/react/shallow';

import Loader from '@components/Loader';
import { useAuthStore } from '@store/authStore';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import type { RootStackParamList } from './types';

// Splash screen checks token presence then immediately navigates away —
// it is always small so it is not lazy-loaded.
const SplashScreen = React.lazy(() => import('@screens/SplashScreen'));

const Root = createNativeStackNavigator<RootStackParamList>();

/**
 * Root navigator.
 *
 * Strategy: React Navigation's conditional stack approach.
 * - While `isInitializing` → show the Splash screen (it owns the loading UI).
 * - After init → render Auth or App stack based on `isAuthenticated`.
 *
 * This pattern avoids navigation-based redirects in useEffect hooks and keeps
 * all routing logic in one place, making it easy to audit and extend.
 */
const RootNavigator: React.FC = () => {
  const { isInitializing, isAuthenticated } = useAuthStore(
    useShallow(state => ({
      isInitializing: state.isInitializing,
      isAuthenticated: state.isAuthenticated,
    })),
  );

  return (
    <Suspense fallback={<Loader />}>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {isInitializing ? (
          <Root.Screen name="Splash" component={SplashScreen as React.ComponentType} />
        ) : isAuthenticated ? (
          <Root.Screen name="SaasAdmin" component={AppNavigator} />
        ) : (
          <Root.Screen name="Auth" component={AuthNavigator} />
        )}
      </Root.Navigator>
    </Suspense>
  );
};

export default RootNavigator;
