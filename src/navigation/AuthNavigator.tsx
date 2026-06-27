import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from './types';

// Screens are imported lazily via React.lazy or directly — direct imports
// are used here so the auth bundle is always available offline.
// Placeholder screens will be replaced in Phase 1.
const LoginScreen = React.lazy(() => import('@features/auth/screens/LoginScreen'));
const RegisterScreen = React.lazy(() => import('@features/auth/screens/RegisterScreen'));
const ForgotPasswordScreen = React.lazy(
  () => import('@features/auth/screens/ForgotPasswordScreen'),
);
const OtpVerificationScreen = React.lazy(
  () => import('@features/auth/screens/OtpVerificationScreen'),
);
const ResetPasswordScreen = React.lazy(
  () => import('@features/auth/screens/ResetPasswordScreen'),
);
const ForceChangePasswordScreen = React.lazy(
  () => import('@features/auth/screens/ForceChangePasswordScreen'),
);

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      gestureEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen as React.ComponentType} />
    <Stack.Screen name="Register" component={RegisterScreen as React.ComponentType} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen as React.ComponentType} />
    <Stack.Screen
      name="OtpVerification"
      component={OtpVerificationScreen as React.ComponentType}
    />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen as React.ComponentType} />
    <Stack.Screen
      name="ForceChangePassword"
      component={ForceChangePasswordScreen as React.ComponentType}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
