/**
 * SAAS_ADMIN navigation configuration — feeds the reusable role shell
 * ({@link createRoleNavigator}). Other roles (Company Admin, Supervisor, Farm
 * Owner) define their own config files the same way and share the shell.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ComingSoonScreen from '@features/dashboard/screens/ComingSoonScreen';
import { showInfo } from '@utils/toast';

import { createRoleNavigator } from './roleNavigation';
import type { MenuItem, TabConfig } from './roleNavigation';
import type { RegistrationsStackParamList, SaasAdminStackParamList } from './types';

// ─── Lazy screens ─────────────────────────────────────────────────────────────

const SaasDashboardScreen = React.lazy(
  () => import('@features/dashboard/screens/SaasDashboardScreen'),
);
const UserListScreen = React.lazy(() => import('@features/users/screens/UserListScreen'));
const UserDetailsScreen = React.lazy(() => import('@features/users/screens/UserDetailsScreen'));
const CreateUserScreen = React.lazy(() => import('@features/users/screens/CreateUserScreen'));
const EditUserScreen = React.lazy(() => import('@features/users/screens/EditUserScreen'));
const RegistrationListScreen = React.lazy(
  () => import('@features/registration/screens/RegistrationListScreen'),
);
const RegistrationDetailScreen = React.lazy(
  () => import('@features/registration/screens/RegistrationDetailScreen'),
);
const NotificationsScreen = React.lazy(
  () => import('@features/notifications/screens/NotificationsScreen'),
);
const ProfileScreen = React.lazy(() => import('@features/profile/screens/ProfileScreen'));
const TenantsScreen = React.lazy(() => import('@features/companies/screens/TenantsScreen'));
const CompanyDetailScreen = React.lazy(
  () => import('@features/companies/screens/CompanyDetailScreen'),
);
const RegisterCompanyScreen = React.lazy(
  () => import('@features/companies/screens/RegisterCompanyScreen'),
);

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

// Registration approvals tab nests the review stack (list → detail).
const RegistrationsStack = createNativeStackNavigator<RegistrationsStackParamList>();
const RegistrationsStackNavigator: React.FC = () => (
  <RegistrationsStack.Navigator
    screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
  >
    <RegistrationsStack.Screen name="RegistrationApprovalList" component={RegistrationListScreen} />
    <RegistrationsStack.Screen
      name="RegistrationApprovalDetail"
      component={RegistrationDetailScreen}
    />
  </RegistrationsStack.Navigator>
);

// Tenants tab: company list → detail, plus SaaS-admin-initiated company registration.
const TenantsStack = createNativeStackNavigator<SaasAdminStackParamList>();
const TenantsStackNavigator: React.FC = () => (
  <TenantsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <TenantsStack.Screen name="CompanyList" component={TenantsScreen} />
    <TenantsStack.Screen name="CompanyDetails" component={CompanyDetailScreen} />
    <TenantsStack.Screen name="RegisterCompany" component={RegisterCompanyScreen} />
  </TenantsStack.Navigator>
);

const ReportsTab: React.FC = () => (
  <ComingSoonScreen
    title="Reports"
    icon="chart-box-outline"
    rightIcon="calendar-blank-outline"
    rightLabel="Pick date range"
    onRightPress={() => showInfo('Date range — coming soon')}
  />
);
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
  {
    name: 'TenantsTab',
    label: 'Tenants',
    icon: 'office-building-outline',
    component: TenantsStackNavigator,
  },
  {
    name: 'UsersTab',
    label: 'Users',
    icon: 'account-multiple-outline',
    component: UsersStackNavigator,
  },
  { name: 'ReportsTab', label: 'Reports', icon: 'chart-box-outline', component: ReportsTab },
  { name: 'MoreTab', label: 'More', icon: 'dots-horizontal', component: MoreTab },
  // Hidden tabs — reachable from the drawer / header bell, not the tab bar.
  {
    name: 'RegistrationsTab',
    label: 'Approvals',
    icon: 'clipboard-check-outline',
    component: RegistrationsStackNavigator,
    hidden: true,
  },
  {
    name: 'NotificationsTab',
    label: 'Notifications',
    icon: 'bell-outline',
    component: NotificationsScreen,
    hidden: true,
  },
  {
    name: 'ProfileTab',
    label: 'My Profile',
    icon: 'account-circle-outline',
    component: ProfileScreen,
    hidden: true,
  },
];

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'home-variant', target: 'DashboardTab' },
  {
    label: 'Tenants (Companies)',
    icon: 'office-building-outline',
    target: 'TenantsTab',
    chevron: true,
  },
  {
    label: 'Registration Approvals',
    icon: 'clipboard-check-outline',
    target: 'RegistrationsTab',
    chevron: true,
  },
  { label: 'Users Management', icon: 'account-group-outline', target: 'UsersTab', chevron: true },
  { label: 'Farms', icon: 'home-outline', target: 'MoreTab', chevron: true },
  { label: 'Flocks Overview', icon: 'bird', target: 'MoreTab', chevron: true },
  { label: 'Reports', icon: 'chart-box-outline', target: 'ReportsTab', chevron: true },
  { label: 'Analytics', icon: 'chart-donut', target: 'MoreTab', chevron: true },
  { label: 'Subscriptions & Billing', icon: 'wallet-outline', target: 'MoreTab', chevron: true },
  { label: 'Activity Logs', icon: 'history', target: 'MoreTab' },
  { label: 'Settings', icon: 'cog-outline', target: 'MoreTab' },
  { label: 'Help & Support', icon: 'help-circle-outline', target: 'MoreTab' },
  { label: 'Terms & Conditions', icon: 'file-document-outline', target: 'MoreTab' },
  { label: 'About PCFMS', icon: 'information-outline', target: 'MoreTab' },
];

const SaasAdminNavigator = createRoleNavigator({ roleLabel: 'SaaS Admin', tabs, menuItems });

export default SaasAdminNavigator;
