import { DrawerActions, useNavigation } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { TEST_IDS } from '@constants/testIDs';
import { Avatar } from '@design-system';
import { useUnreadCount } from '@features/notifications/hooks/useNotifications';
import { useRegistrationList } from '@features/registration/hooks/useRegistrationReview';
import { REGISTRATION_TYPE_LABEL } from '@features/registration/types';
import type { RegistrationResponse } from '@features/registration/types';
import { useAuthStore } from '@store/authStore';

// ─── Palette (matches the SaaS dashboard / saas-admin-dashboard.png) ─────────
const HEADER_TOP = '#1E8038';
const HEADER_BOTTOM = '#14672A';
const GREEN = '#1E7D34';
const TEXT_DARK = '#1A1A1A';
const TEXT_GREY = '#7A7A7A';
const CARD_BORDER = '#ECECEC';
const TILE_GREEN_BG = '#E7F4E9';
const TILE_ORANGE_BG = '#FCEBD2';
const ORANGE = '#F0922B';

const hit = { top: 8, bottom: 8, left: 8, right: 8 };

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

const QUICK_LINKS = [
  {
    key: 'farms',
    label: 'Farms',
    icon: 'home-variant',
    tile: TILE_GREEN_BG,
    tint: GREEN,
    target: 'FarmsTab',
  },
  {
    key: 'supervisors',
    label: 'Supervisors',
    icon: 'account-tie-outline',
    tile: TILE_ORANGE_BG,
    tint: ORANGE,
    target: 'SupervisorsTab',
  },
  {
    key: 'farmers',
    label: 'Farmers',
    icon: 'account-group-outline',
    tile: TILE_GREEN_BG,
    tint: GREEN,
    target: 'FarmersTab',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: 'chart-box-outline',
    tile: TILE_ORANGE_BG,
    tint: ORANGE,
    target: 'ReportsTab',
  },
] as const;

const TenantAdminDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);
  const userName = user?.name;

  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const openNotifications = () => navigation.navigate('NotificationsTab' as never);
  const openApprovals = () => navigation.navigate('RegistrationsTab' as never);
  const openProfile = () => navigation.navigate('ProfileTab' as never);

  const openRequest = useCallback(
    (id: string) => {
      navigation.navigate(
        'RegistrationsTab' as never,
        { screen: 'RegistrationApprovalDetail', params: { id } } as never,
      );
    },
    [navigation],
  );

  const { data: unread } = useUnreadCount();
  const hasUnread = (unread?.unreadCount ?? 0) > 0;

  const { data: pending } = useRegistrationList({ status: 'PENDING' });
  const pendingCount = pending?.total ?? 0;
  const recent: RegistrationResponse[] = (pending?.items ?? []).slice(0, 4);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_TOP} translucent={false} />

      {/* ─── Green header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="thdr" x1="0" y1="0" x2="0.6" y2="1">
              <Stop offset="0" stopColor={HEADER_TOP} />
              <Stop offset="1" stopColor={HEADER_BOTTOM} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#thdr)" />
        </Svg>

        <View style={styles.headerTop}>
          <TouchableOpacity
            testID={TEST_IDS.session.openMenuButton}
            hitSlop={hit}
            style={styles.menuBtn}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={openDrawer}
          >
            <Icon name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <View style={styles.flex} />
          <TouchableOpacity
            hitSlop={hit}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={openNotifications}
          >
            <Icon name="bell-outline" size={24} color="#FFFFFF" />
            {hasUnread && <View style={styles.bellDot} />}
          </TouchableOpacity>
        </View>

        <View style={styles.greetRow}>
          <View style={styles.flex}>
            <Text style={styles.greetHi}>Hello, {userName ?? 'Company Admin'}!</Text>
            <Text style={styles.greetSub}>Here&apos;s what&apos;s happening today.</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View profile"
            style={styles.avatar}
            onPress={openProfile}
          >
            <Avatar
              name={user?.name}
              imageUri={user?.avatarUrl ?? undefined}
              size="lg"
              backgroundColor="#E8EAED"
              textColor="#9AA0A6"
              placeholderIcon
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── White sheet ─── */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending approvals highlight */}
        <TouchableOpacity
          testID="dashboard-pending-approvals"
          style={styles.approvalCard}
          activeOpacity={0.85}
          onPress={openApprovals}
        >
          <View style={styles.approvalIcon}>
            <Icon name="clipboard-check-outline" size={26} color="#FFFFFF" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.approvalTitle}>Registration Approvals</Text>
            <Text style={styles.approvalSub}>
              {pendingCount > 0
                ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} awaiting your review`
                : 'No pending requests'}
            </Text>
          </View>
          {pendingCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{pendingCount}</Text>
            </View>
          )}
          <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>

        {/* Quick links */}
        <View style={styles.quickGrid}>
          {QUICK_LINKS.map(link => (
            <TouchableOpacity
              key={link.key}
              style={styles.quickTile}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(link.target as never)}
            >
              <View style={[styles.quickIcon, { backgroundColor: link.tile }]}>
                <Icon name={link.icon} size={22} color={link.tint} />
              </View>
              <Text style={styles.quickLabel}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent registration requests */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          {pendingCount > 0 && (
            <TouchableOpacity hitSlop={hit} onPress={openApprovals}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recent.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="clipboard-text-outline" size={40} color="#C4C9C4" />
            <Text style={styles.emptyText}>No pending registration requests.</Text>
          </View>
        ) : (
          recent.map(req => (
            <TouchableOpacity
              key={req.id}
              style={styles.requestRow}
              activeOpacity={0.8}
              onPress={() => openRequest(req.id)}
            >
              <View style={styles.requestTile}>
                <Icon name="account-clock-outline" size={20} color={GREEN} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.requestName}>
                  {req.firstName} {req.lastName}
                </Text>
                <Text style={styles.requestMeta}>
                  {REGISTRATION_TYPE_LABEL[req.requestType]} · {formatDate(req.createdAt)}
                </Text>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },

  header: { paddingHorizontal: 20, paddingBottom: 30, backgroundColor: HEADER_TOP },
  headerTop: { flexDirection: 'row', alignItems: 'center', height: 40 },
  menuBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
    borderWidth: 1,
    borderColor: HEADER_TOP,
  },
  greetRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  greetHi: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  greetSub: { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginTop: 4 },
  avatar: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },

  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },

  approvalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 18,
  },
  approvalIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvalTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  approvalSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 3 },
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: { fontSize: 13, fontWeight: '800', color: GREEN },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8 },
  quickTile: {
    width: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    padding: 12,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },

  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  viewAll: { fontSize: 13, fontWeight: '600', color: GREEN },

  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  requestTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: TILE_GREEN_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestName: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  requestMeta: { fontSize: 12, color: TEXT_GREY, marginTop: 3 },
  pendingBadge: {
    backgroundColor: '#FFF8E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingText: { fontSize: 12, fontWeight: '600', color: '#B26A00' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: TEXT_GREY, marginTop: 12 },
});

export default TenantAdminDashboardScreen;
