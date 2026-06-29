/**
 * SAAS_ADMIN navigation configuration — feeds the reusable role shell
 * ({@link createRoleNavigator}). Other roles (Company Admin, Supervisor, Farm
 * Owner) define their own config files the same way and share the shell.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ComingSoonScreen from '@features/dashboard/screens/ComingSoonScreen';

import { createRoleNavigator } from './roleNavigation';
import type { MenuItem, TabConfig } from './roleNavigation';
import type { SaasAdminStackParamList } from './types';

// ─── Lazy screens ─────────────────────────────────────────────────────────────

const SaasDashboardScreen = React.lazy(
  () => import('@features/dashboard/screens/SaasDashboardScreen'),
);
const UserListScreen = React.lazy(() => import('@features/users/screens/UserListScreen'));
const UserDetailsScreen = React.lazy(() => import('@features/users/screens/UserDetailsScreen'));
const CreateUserScreen = React.lazy(() => import('@features/users/screens/CreateUserScreen'));
const EditUserScreen = React.lazy(() => import('@features/users/screens/EditUserScreen'));

// Users tab nests the existing user-management stack.
const UsersStack = createNativeStackNavigator<SaasAdminStackParamList>();
const UsersStackNavigator: React.FC = () => (
  <UsersStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <UsersStack.Screen name="UserList" component={UserListScreen} />
    <UsersStack.Screen name="UserDetails" component={UserDetailsScreen} />
    <UsersStack.Screen name="CreateUser" component={CreateUserScreen} />
    <UsersStack.Screen name="EditUser" component={EditUserScreen} />
  </UsersStack.Navigator>
);

const TenantsTab: React.FC = () => (
  <ComingSoonScreen title="Tenants" icon="office-building-outline" />
);
const ReportsTab: React.FC = () => <ComingSoonScreen title="Reports" icon="chart-box-outline" />;
const MoreTab: React.FC = () => (
  <ComingSoonScreen title="More" icon="dots-horizontal-circle-outline" />
);

// ─── Config ───────────────────────────────────────────────────────────────────

const tabs: TabConfig[] = [
  {
    name: 'DashboardTab',
    label: 'Dashboard',
    icon: 'home-variant',
    component: SaasDashboardScreen,
  },
  { name: 'TenantsTab', label: 'Tenants', icon: 'office-building-outline', component: TenantsTab },
  {
    name: 'UsersTab',
    label: 'Users',
    icon: 'account-multiple-outline',
    component: UsersStackNavigator,
  },
  { name: 'ReportsTab', label: 'Reports', icon: 'chart-box-outline', component: ReportsTab },
  { name: 'MoreTab', label: 'More', icon: 'dots-horizontal', component: MoreTab },
];

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'home-variant', target: 'DashboardTab' },
  {
    label: 'Tenants (Companies)',
    icon: 'office-building-outline',
    target: 'TenantsTab',
    chevron: true,
  },
  { label: 'Users Management', icon: 'account-group-outline', target: 'UsersTab', chevron: true },
  { label: 'Farms', icon: 'home-outline', target: 'MoreTab', chevron: true },
  { label: 'Flocks Overview', icon: 'bird', target: 'MoreTab', chevron: true },
  { label: 'Reports', icon: 'chart-box-outline', target: 'ReportsTab', chevron: true },
  { label: 'Analytics', icon: 'chart-donut', target: 'MoreTab', chevron: true },
  { label: 'Subscriptions & Billing', icon: 'wallet-outline', target: 'MoreTab', chevron: true },
  { label: 'Notifications', icon: 'bell-outline', target: 'MoreTab' },
  { label: 'Activity Logs', icon: 'history', target: 'MoreTab' },
  { label: 'Settings', icon: 'cog-outline', target: 'MoreTab' },
  { label: 'Help & Support', icon: 'help-circle-outline', target: 'MoreTab' },
  { label: 'Terms & Conditions', icon: 'file-document-outline', target: 'MoreTab' },
  { label: 'About PCFMS', icon: 'information-outline', target: 'MoreTab' },
];

const SaasAdminNavigator = createRoleNavigator({ roleLabel: 'SaaS Admin', tabs, menuItems });

export default SaasAdminNavigator;
