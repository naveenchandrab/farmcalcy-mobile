import React, { Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Loader from '@components/Loader';
import { useAuthStore } from '@store/authStore';
import type {
  SaasAdminStackParamList,
  SupervisorStackParamList,
  TenantAdminStackParamList,
} from './types';

// ─── Screen lazy imports ──────────────────────────────────────────────────────
// Lazy loading keeps the initial bundle small. Each role group loads
// independently so TENANT_ADMIN never downloads SAAS_ADMIN screens.

// SAAS Admin screens
const UserListScreen = React.lazy(
  () => import('@features/users/screens/UserListScreen'),
);
const UserDetailsScreen = React.lazy(
  () => import('@features/users/screens/UserDetailsScreen'),
);
const CreateUserScreen = React.lazy(
  () => import('@features/users/screens/CreateUserScreen'),
);
const EditUserScreen = React.lazy(
  () => import('@features/users/screens/EditUserScreen'),
);

// ─── SAAS Admin Navigator ────────────────────────────────────────────────────

const SaasStack = createNativeStackNavigator<SaasAdminStackParamList>();

const SaasAdminNavigator: React.FC = () => (
  <SaasStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    {/* Phase 1: User Management */}
    <SaasStack.Screen name="UserList" component={UserListScreen as React.ComponentType} />
    <SaasStack.Screen name="UserDetails" component={UserDetailsScreen as React.ComponentType} />
    <SaasStack.Screen name="CreateUser" component={CreateUserScreen as React.ComponentType} />
    <SaasStack.Screen name="EditUser" component={EditUserScreen as React.ComponentType} />

    {/* Phase 2: Company Management (screens added when phase ships) */}
    {/* <SaasStack.Screen name="SaasDashboard" component={SaasDashboardScreen} /> */}
    {/* <SaasStack.Screen name="CompanyList" component={CompanyListScreen} /> */}
  </SaasStack.Navigator>
);

// ─── Tenant Admin Navigator ───────────────────────────────────────────────────

const TenantStack = createNativeStackNavigator<TenantAdminStackParamList>();

const TenantAdminNavigator: React.FC = () => (
  <TenantStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    {/* Phase 3+ screens added progressively */}
  </TenantStack.Navigator>
);

// ─── Supervisor Navigator ─────────────────────────────────────────────────────

const SupervisorStack = createNativeStackNavigator<SupervisorStackParamList>();

const SupervisorNavigator: React.FC = () => (
  <SupervisorStack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}
  >
    {/* Phase 4+ screens added progressively */}
  </SupervisorStack.Navigator>
);

// ─── Role-based router ────────────────────────────────────────────────────────

/**
 * Renders the appropriate navigator based on the authenticated user's role.
 * All role-specific screen bundles are lazy-loaded to keep cold start fast.
 */
const AppNavigator: React.FC = () => {
  const role = useAuthStore(state => state.user?.role);

  return (
    <Suspense fallback={<Loader />}>
      {role === 'SAAS_ADMIN' && <SaasAdminNavigator />}
      {role === 'TENANT_ADMIN' && <TenantAdminNavigator />}
      {role === 'SUPERVISOR' && <SupervisorNavigator />}
      {/* FARMER role navigator added in Phase 3+ */}
    </Suspense>
  );
};

export default AppNavigator;
