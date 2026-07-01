import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useAuthStore } from '@store/authStore';

import type { AuthStackParamList } from './types';

// Screens are imported lazily via React.lazy or directly — direct imports
// are used here so the auth bundle is always available offline.
// Placeholder screens will be replaced in Phase 1.
const LoginScreen = React.lazy(() => import('@features/auth/screens/LoginScreen'));
const RegisterScreen = React.lazy(() => import('@features/auth/screens/RegisterScreen'));
const RegisterTenantScreen = React.lazy(
  () => import('@features/registration/screens/RegisterTenantScreen'),
);
const RegisterSupervisorScreen = React.lazy(
  () => import('@features/registration/screens/RegisterSupervisorScreen'),
);
const RegisterFarmOwnerScreen = React.lazy(
  () => import('@features/registration/screens/RegisterFarmOwnerScreen'),
);
const RegistrationPendingScreen = React.lazy(
  () => import('@features/registration/screens/RegistrationPendingScreen'),
);
const TrackRegistrationScreen = React.lazy(
  () => import('@features/registration/screens/TrackRegistrationScreen'),
);
const ForgotPasswordScreen = React.lazy(
  () => import('@features/auth/screens/ForgotPasswordScreen'),
);
const OtpVerificationScreen = React.lazy(
  () => import('@features/auth/screens/OtpVerificationScreen'),
);
const ResetPasswordScreen = React.lazy(() => import('@features/auth/screens/ResetPasswordScreen'));
const ForceChangePasswordScreen = React.lazy(
  () => import('@features/auth/screens/ForceChangePasswordScreen'),
);

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  // When the app cold-starts with a session that still requires a forced
  // password change, land directly on that screen instead of Login.
  const mustChangePassword = useAuthStore(state => state.mustChangePassword);
  const email = useAuthStore(state => state.user?.email ?? '');

  return (
    <Stack.Navigator
      initialRouteName={mustChangePassword ? 'ForceChangePassword' : 'Login'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="RegisterTenant" component={RegisterTenantScreen} />
      <Stack.Screen name="RegisterSupervisor" component={RegisterSupervisorScreen} />
      <Stack.Screen name="RegisterFarmOwner" component={RegisterFarmOwnerScreen} />
      <Stack.Screen
        name="RegistrationPending"
        component={RegistrationPendingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="TrackRegistration" component={TrackRegistrationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="ForceChangePassword"
        component={ForceChangePasswordScreen}
        initialParams={{ email }}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
