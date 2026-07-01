import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { TEST_IDS } from '@constants/testIDs';
import { Avatar } from '@design-system';
import { useUnreadCount } from '@features/notifications/hooks/useNotifications';
import { useAuthStore } from '@store/authStore';

// ─── Palette (sampled from saas-admin-dashboard.png) ─────────────────────────
const HEADER_TOP = '#1E8038';
const HEADER_BOTTOM = '#14672A';
const GREEN = '#1E7D34';
const TEXT_DARK = '#1A1A1A';
const TEXT_GREY = '#7A7A7A';
const CARD_BORDER = '#ECECEC';
const BADGE_BG = '#E7F5EA';
const TILE_GREEN_BG = '#E7F4E9';
const TILE_ORANGE_BG = '#FCEBD2';
const ORANGE = '#F0922B';

// ─── Reproduced static data ──────────────────────────────────────────────────
const STAT_CARDS = [
  {
    title: 'Total Tenants',
    value: '12',
    sub: 'Active',
    icon: 'office-building',
    tint: GREEN,
    emoji: null,
  },
  {
    title: 'Total Farms',
    value: '56',
    sub: 'Across Tenants',
    icon: 'home-variant',
    tint: GREEN,
    emoji: null,
  },
  {
    title: 'Total Flocks',
    value: '248',
    sub: 'Across Farms',
    icon: null,
    tint: GREEN,
    emoji: '🐥',
  },
  {
    title: 'Total Birds',
    value: '1,24,560',
    sub: 'Across Flocks',
    icon: null,
    tint: GREEN,
    emoji: '🐥',
  },
] as const;

const RECENT_TENANTS = [
  { name: 'Green Valley Farms', date: 'Added on 20 May 2024', tile: TILE_GREEN_BG, tint: GREEN },
  {
    name: 'Sunrise Poultry Pvt Ltd',
    date: 'Added on 18 May 2024',
    tile: TILE_ORANGE_BG,
    tint: ORANGE,
  },
  { name: 'Krishna Poultry', date: 'Added on 15 May 2024', tile: TILE_GREEN_BG, tint: GREEN },
] as const;

const StatCard: React.FC<(typeof STAT_CARDS)[number]> = ({
  title,
  value,
  sub,
  icon,
  tint,
  emoji,
}) => (
  <View style={styles.statCard}>
    <View style={styles.statTextCol}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
    {emoji ? (
      <Text style={styles.statEmoji}>{emoji}</Text>
    ) : (
      <Icon name={icon ?? 'office-building'} size={34} color={tint} />
    )}
  </View>
);

const SaasDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore(s => s.user);
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const openNotifications = () => navigation.navigate('NotificationsTab' as never);
  const openProfile = () => navigation.navigate('ProfileTab' as never);
  const { data: unread } = useUnreadCount();
  const hasUnread = (unread?.unreadCount ?? 0) > 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={HEADER_TOP} translucent={false} />

      {/* ─── Green header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="hdr" x1="0" y1="0" x2="0.6" y2="1">
              <Stop offset="0" stopColor={HEADER_TOP} />
              <Stop offset="1" stopColor={HEADER_BOTTOM} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#hdr)" />
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
            <Text style={styles.greetHi}>Hello, SaaS Admin!</Text>
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
        {/* Filter row */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.monthPill} activeOpacity={0.7}>
            <Text style={styles.monthText}>This Month</Text>
            <Icon name="chevron-down" size={20} color={TEXT_DARK} />
          </TouchableOpacity>
          <View style={styles.dateRange}>
            <Icon name="calendar-blank-outline" size={18} color={GREEN} />
            <Text style={styles.dateText}>01 May - 31 May 2024</Text>
          </View>
        </View>

        {/* 2×2 stat cards */}
        <View style={styles.statRow}>
          <StatCard {...STAT_CARDS[0]} />
          <StatCard {...STAT_CARDS[1]} />
        </View>
        <View style={styles.statRow}>
          <StatCard {...STAT_CARDS[2]} />
          <StatCard {...STAT_CARDS[3]} />
        </View>

        {/* Recent Tenants */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Recent Tenants</Text>
          <TouchableOpacity hitSlop={hit}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {RECENT_TENANTS.map(tenant => (
          <View key={tenant.name} style={styles.tenantRow}>
            <View style={[styles.tenantTile, { backgroundColor: tenant.tile }]}>
              <Icon name="office-building" size={20} color={tenant.tint} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.tenantName}>{tenant.name}</Text>
              <Text style={styles.tenantDate}>{tenant.date}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const hit = { top: 8, bottom: 8, left: 8, right: 8 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: HEADER_TOP,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
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
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  greetHi: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  greetSub: { fontSize: 13, color: 'rgba(255,255,255,0.88)', marginTop: 4 },
  avatar: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -22,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Filter row
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: 10,
    paddingLeft: 14,
    paddingRight: 8,
    height: 40,
  },
  monthText: { fontSize: 14, color: TEXT_DARK, fontWeight: '500', marginRight: 8 },
  dateRange: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 13, color: '#4A4A4A' },

  // Stat cards
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  statTextCol: { flex: 1 },
  statTitle: { fontSize: 13, color: TEXT_GREY },
  statValue: { fontSize: 22, fontWeight: '700', color: TEXT_DARK, marginTop: 6 },
  statSub: { fontSize: 12, color: TEXT_GREY, marginTop: 4 },
  statEmoji: { fontSize: 30 },

  // Section
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT_DARK },
  viewAll: { fontSize: 13, fontWeight: '600', color: GREEN },

  // Tenant rows
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  tenantTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tenantName: { fontSize: 14, fontWeight: '700', color: TEXT_DARK },
  tenantDate: { fontSize: 12, color: TEXT_GREY, marginTop: 3 },
  statusBadge: {
    backgroundColor: BADGE_BG,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: GREEN },
});

export default SaasDashboardScreen;
