/**
 * Reusable role-based shell: a Drawer ("hamburger menu") hosting a bottom-tab
 * navigator. Every role (SAAS_ADMIN, TENANT_ADMIN / Company Admin, SUPERVISOR,
 * FARM_OWNER…) builds its own navigator from a {@link RoleNavConfig} — the tab
 * bar, the drawer menu and the role label are all data, so the components here
 * are shared across roles and never hard-code one role's options.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import React, { Suspense } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import Loader from '@components/Loader';
import { useAuthStore } from '@store/authStore';

const GREEN = '#1E7D34';
const ACTIVE_BG = '#E7F4E9';
const DANGER = '#D64541';
const ACTIVE_TINT = '#1E7D34';
const INACTIVE_TINT = '#9AA0A6';

// ─── Config types ─────────────────────────────────────────────────────────────

export interface TabConfig {
  /** Unique route name within the role's tab navigator. */
  name: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

export interface MenuItem {
  label: string;
  icon: string;
  /** Tab route name this item activates. Sections without a screen yet may
   *  point at a placeholder tab (e.g. "More"). */
  target: string;
  chevron?: boolean;
}

export interface RoleNavConfig {
  /** Shown on the drawer profile badge, e.g. "SaaS Admin", "Farm Owner". */
  roleLabel: string;
  tabs: TabConfig[];
  menuItems: MenuItem[];
}

// ─── Drawer content (generic) ─────────────────────────────────────────────────

type DrawerProps = DrawerContentComponentProps & {
  roleLabel: string;
  menuItems: readonly MenuItem[];
};

/** Reads the focused bottom-tab name out of the nested drawer state. */
const activeTabName = (state: DrawerContentComponentProps['state']): string | null => {
  const home = state.routes.find(r => r.name === 'Home');
  const tabState = home?.state as { index: number; routeNames: string[] } | undefined;
  if (!tabState) {
    return null;
  }
  return tabState.routeNames[tabState.index] ?? null;
};

const AppDrawerContent: React.FC<DrawerProps> = ({ roleLabel, menuItems, ...props }) => {
  const { navigation, state } = props;
  const user = useAuthStore(s => s.user);
  const active = activeTabName(state);

  const go = (target: string) => {
    navigation.navigate('Home', { screen: target });
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      {/* Brand */}
      <View style={styles.brand}>
        <Image
          source={require('@assets/images/splash-logo.png') as ImageSourcePropType}
          style={styles.brandLogo}
          resizeMode="contain"
        />
        <View style={styles.brandTextCol}>
          <Text style={styles.brandTitle}>PCFMS</Text>
          <Text style={styles.brandSub}>POULTRY CONTRACT FARMING{'\n'}MANAGEMENT SYSTEM</Text>
        </View>
      </View>

      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Icon name="account" size={28} color="#9AA0A6" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.profileName}>{user?.name ?? roleLabel}</Text>
          <Text style={styles.profileEmail} numberOfLines={1}>
            {user?.email ?? '—'}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
        </View>
        <Icon name="chevron-down" size={20} color="#9AA0A6" />
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map(item => {
          const isActive = item.target === active && item.target !== 'MoreTab';
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.item, isActive && styles.itemActive]}
              activeOpacity={0.7}
              onPress={() => go(item.target)}
            >
              <Icon
                name={item.icon}
                size={22}
                color={isActive ? GREEN : '#3A3A3A'}
                style={styles.itemIcon}
              />
              <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
                {item.label}
              </Text>
              {item.chevron && <Icon name="chevron-right" size={20} color="#B5B5B5" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logout}
        activeOpacity={0.7}
        onPress={() => {
          navigation.closeDrawer();
          void useAuthStore.getState().logout();
        }}
      >
        <Icon name="logout" size={22} color={DANGER} style={styles.itemIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>v1.0.0</Text>
    </DrawerContentScrollView>
  );
};

// ─── Factories ────────────────────────────────────────────────────────────────

/** Builds a role's reusable bottom-tab navigator from its tab config. */
const buildTabs = (tabs: readonly TabConfig[]): React.FC => {
  const Tab = createBottomTabNavigator();
  const TabsComponent: React.FC = () => (
    <Suspense fallback={<Loader />}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE_TINT,
          tabBarInactiveTintColor: INACTIVE_TINT,
          tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
          tabBarStyle: {
            height: 58,
            paddingTop: 6,
            paddingBottom: 6,
            borderTopWidth: 1,
            borderTopColor: '#EEEEEE',
            backgroundColor: '#FFFFFF',
          },
        }}
      >
        {tabs.map(tab => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              title: tab.label,
              tabBarIcon: ({ color, size }) => <Icon name={tab.icon} size={size} color={color} />,
            }}
          />
        ))}
      </Tab.Navigator>
    </Suspense>
  );
  return TabsComponent;
};

/** Builds a role's Drawer (hamburger) wrapping its bottom tabs. */
export const createRoleNavigator = (config: RoleNavConfig): React.FC => {
  const Drawer = createDrawerNavigator();
  const Tabs = buildTabs(config.tabs);

  const RoleNavigator: React.FC = () => (
    <Drawer.Navigator
      drawerContent={props => (
        <AppDrawerContent {...props} roleLabel={config.roleLabel} menuItems={config.menuItems} />
      )}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: '82%' },
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen name="Home" component={Tabs} />
    </Drawer.Navigator>
  );
  return RoleNavigator;
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  drawerContent: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 24 },

  brand: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  brandLogo: { width: 56, height: 56 },
  brandTextCol: { marginLeft: 10 },
  brandTitle: { fontSize: 22, fontWeight: '800', color: GREEN, letterSpacing: 0.5 },
  brandSub: { fontSize: 8, fontWeight: '700', color: GREEN, marginTop: 2, lineHeight: 11 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F1',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
    gap: 10,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E5E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  profileEmail: { fontSize: 12, color: '#7A7A7A', marginTop: 1 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E7F4E9',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 5,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '600', color: GREEN },

  menu: { marginTop: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  itemActive: { backgroundColor: ACTIVE_BG },
  itemIcon: { width: 28 },
  itemLabel: { flex: 1, fontSize: 15, color: '#3A3A3A', fontWeight: '500' },
  itemLabelActive: { color: GREEN, fontWeight: '700' },

  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FBEBEA',
    marginTop: 16,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: DANGER },
  version: { textAlign: 'center', fontSize: 12, color: '#9AA0A6', marginTop: 16 },
});

export default createRoleNavigator;
