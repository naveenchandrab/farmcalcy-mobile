/**
 * TENANT_ADMIN (Company Admin) navigation configuration — feeds the reusable
 * role shell ({@link createRoleNavigator}). Mirrors the SAAS_ADMIN config: a
 * Drawer hosting a bottom-tab navigator, with the registration-approval review
 * stack and notifications mounted as hidden tabs (reachable from the drawer /
 * the dashboard bell).
 *
 * Farms / Supervisors / Farmers / Reports are placeholders until their tenant
 * management screens land; the registration-approval flow is fully wired.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import ComingSoonScreen from '@features/dashboard/screens/ComingSoonScreen';
import { showInfo } from '@utils/toast';

import { createRoleNavigator } from './roleNavigation';
import type { MenuItem, TabConfig } from './roleNavigation';
import type { RegistrationsStackParamList } from './types';

// ─── Lazy screens ─────────────────────────────────────────────────────────────

const TenantAdminDashboardScreen = React.lazy(
  () => import('@features/dashboard/screens/TenantAdminDashboardScreen'),
);
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

// ─── Placeholder tabs (real screens land in later phases) ─────────────────────

const FarmsTab: React.FC = () => (
  <ComingSoonScreen
    title="Farms"
    icon="home-variant"
    rightIcon="plus"
    rightLabel="Add farm"
    onRightPress={() => showInfo('Add Farm — coming soon')}
  />
);
const SupervisorsTab: React.FC = () => (
  <ComingSoonScreen
    title="Supervisors"
    icon="account-tie-outline"
    rightIcon="plus"
    rightLabel="Add supervisor"
    onRightPress={() => showInfo('Add Supervisor — coming soon')}
  />
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
    component: TenantAdminDashboardScreen,
  },
  { name: 'FarmsTab', label: 'Farms', icon: 'home-outline', component: FarmsTab },
  { name: 'SupervisorsTab', label: 'Team', icon: 'account-tie-outline', component: SupervisorsTab },
  { name: 'ReportsTab', label: 'Reports', icon: 'chart-box-outline', component: ReportsTab },
  { name: 'MoreTab', label: 'More', icon: 'dots-horizontal', component: MoreTab },
  // Hidden tabs — reachable from the drawer / header bell, not the tab bar.
  {
    name: 'FarmersTab',
    label: 'Farmers',
    icon: 'account-group-outline',
    component: MoreTab,
    hidden: true,
  },
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
    label: 'Registration Approvals',
    icon: 'clipboard-check-outline',
    target: 'RegistrationsTab',
    chevron: true,
  },
  { label: 'Farms', icon: 'home-outline', target: 'FarmsTab', chevron: true },
  { label: 'Supervisors', icon: 'account-tie-outline', target: 'SupervisorsTab', chevron: true },
  { label: 'Farmers', icon: 'account-group-outline', target: 'FarmersTab', chevron: true },
  { label: 'Notifications', icon: 'bell-outline', target: 'NotificationsTab', chevron: true },
  { label: 'Reports', icon: 'chart-box-outline', target: 'ReportsTab', chevron: true },
  { label: 'Settings', icon: 'cog-outline', target: 'MoreTab' },
  { label: 'Help & Support', icon: 'help-circle-outline', target: 'MoreTab' },
  { label: 'About PCFMS', icon: 'information-outline', target: 'MoreTab' },
];

const TenantAdminNavigator = createRoleNavigator({
  roleLabel: 'Company Admin',
  tabs,
  menuItems,
});

export default TenantAdminNavigator;
