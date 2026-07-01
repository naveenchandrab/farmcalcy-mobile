import React, { Suspense } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Loader from '@components/Loader';
import { useAuthStore } from '@store/authStore';

import SaasAdminNavigator from './saasAdminNavigation';
import TenantAdminNavigator from './tenantAdminNavigation';

// Each role uses the shared Drawer + bottom-tab shell (roleNavigation.tsx)
// configured with its own tabs and hamburger-menu options. SAAS_ADMIN and
// TENANT_ADMIN are wired; Supervisor / Farm Owner get their own config files as
// their screens land — until then they show a standalone placeholder.

const RolePlaceholder: React.FC<{ role: string }> = ({ role }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.placeholder, { paddingTop: insets.top }]}>
      <View style={styles.iconCircle}>
        <Icon name="hammer-wrench" size={40} color="#2E7D32" />
      </View>
      <Text style={styles.title}>{role}</Text>
      <Text style={styles.subtitle}>This experience is coming soon.</Text>
    </View>
  );
};

/**
 * Renders the appropriate navigator based on the authenticated user's role.
 */
const AppNavigator: React.FC = () => {
  const role = useAuthStore(state => state.user?.role);

  return (
    <Suspense fallback={<Loader />}>
      {role === 'SAAS_ADMIN' && <SaasAdminNavigator />}
      {role === 'TENANT_ADMIN' && <TenantAdminNavigator />}
      {role === 'SUPERVISOR' && <RolePlaceholder role="Supervisor" />}
      {role === 'FARMER' && <RolePlaceholder role="Farm Owner" />}
    </Suspense>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#7A7A7A', marginTop: 6 },
});

export default AppNavigator;
