import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ScreenHeader from '@navigation/ScreenHeader';
import type { SaasAdminStackParamList } from '@navigation/types';

import { useCompanyList } from '../hooks/useCompanies';
import type { CompanyDto, SubscriptionStatus, SubscriptionStatusFilter } from '../types';

const GREEN = '#1E8038';
const MUTED = '#7A7A7A';
const BORDER = '#ECECEC';

type Nav = NativeStackNavigationProp<SaasAdminStackParamList>;

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

const ACTIVE_FILTERS: ActiveFilter[] = ['ALL', 'ACTIVE', 'INACTIVE'];
const ACTIVE_LABELS: Record<ActiveFilter, string> = {
  ALL: 'All',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const SUB_FILTERS: SubscriptionStatusFilter[] = [
  'ALL',
  'TRIAL',
  'ACTIVE',
  'EXPIRED',
  'SUSPENDED',
  'CANCELLED',
];
const SUB_LABELS: Record<SubscriptionStatusFilter, string> = {
  ALL: 'All Plans',
  TRIAL: 'Trial',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled',
};

const SUB_BADGE: Record<SubscriptionStatus, { text: string; bg: string }> = {
  TRIAL: { text: '#B26A00', bg: '#FFF8E1' },
  ACTIVE: { text: '#2E7D32', bg: '#E8F5E9' },
  EXPIRED: { text: '#C62828', bg: '#FFEBEE' },
  SUSPENDED: { text: '#C62828', bg: '#FFEBEE' },
  CANCELLED: { text: '#616161', bg: '#F5F5F5' },
};

const CompanyCard: React.FC<{ item: CompanyDto; onPress: () => void }> = ({ item, onPress }) => {
  const badge = SUB_BADGE[item.subscriptionStatus];
  const initial = item.name.charAt(0).toUpperCase();
  const location = [item.district, item.state].filter(Boolean).join(', ');
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={item.name}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconInitial}>{initial}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{item.subscriptionStatus}</Text>
          </View>
        </View>
        <Text style={styles.cardCode}>{item.code}</Text>
        {location ? (
          <Text style={styles.cardMeta} numberOfLines={1}>
            <Icon name="map-marker-outline" size={11} color={MUTED} /> {location}
          </Text>
        ) : null}
        <Text style={styles.cardMeta} numberOfLines={1}>
          {item.email}
        </Text>
      </View>
      <View style={[styles.activeDot, { backgroundColor: item.isActive ? GREEN : '#BDBDBD' }]} />
    </TouchableOpacity>
  );
};

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const TenantsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('ALL');
  const [subFilter, setSubFilter] = useState<SubscriptionStatusFilter>('ALL');

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 300);
  }, []);

  const params = {
    search: debouncedSearch || undefined,
    isActive: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
    subscriptionStatus: subFilter === 'ALL' ? undefined : subFilter,
    page: 1,
    limit: 50,
  };

  const { data, isLoading, isRefetching, refetch } = useCompanyList(params);

  const renderItem = useCallback(
    ({ item }: { item: CompanyDto }) => (
      <CompanyCard
        item={item}
        onPress={() => navigation.navigate('CompanyDetails', { companyId: item.id })}
      />
    ),
    [navigation],
  );

  const openRegisterCompany = useCallback(() => {
    navigation.navigate('RegisterCompany');
  }, [navigation]);

  return (
    <View style={styles.flex}>
      <ScreenHeader
        title="Tenants"
        variant="dashboard"
        rightIcon="plus"
        rightLabel="Register Company"
        onRightPress={openRegisterCompany}
      />

      {/* Search */}
      <View style={styles.searchRow}>
        <Icon name="magnify" size={20} color={MUTED} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, code or email…"
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Active filter — ScrollView avoids FlatList height-expansion in flex containers */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {ACTIVE_FILTERS.map(f => (
          <FilterChip
            key={f}
            label={ACTIVE_LABELS[f]}
            active={activeFilter === f}
            onPress={() => setActiveFilter(f)}
          />
        ))}
      </ScrollView>

      {/* Subscription filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={[styles.filterRow, styles.filterRowBottom]}
      >
        {SUB_FILTERS.map(f => (
          <FilterChip
            key={f}
            label={SUB_LABELS[f]}
            active={subFilter === f}
            onPress={() => setSubFilter(f)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={GREEN} />
        </View>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={() => void refetch()}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="office-building-outline" size={48} color="#C4C9C4" />
              <Text style={styles.emptyText}>
                {debouncedSearch ? `No tenants matching "${debouncedSearch}"` : 'No tenants found.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            data && data.total > 0 ? (
              <Text style={styles.footerText}>
                Showing {data.items.length} of {data.total} tenants
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F9F7' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#1A1A1A',
  },

  // ScrollView must not flex-grow so it stays at intrinsic content height
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterRowBottom: {
    paddingTop: 0,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },

  chip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F1',
  },
  chipActive: { backgroundColor: '#E7F4E9' },
  chipText: { fontSize: 13, fontWeight: '600', color: MUTED },
  chipTextActive: { color: GREEN },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: { padding: 16, gap: 12, flexGrow: 1 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconInitial: { fontSize: 18, fontWeight: '700', color: GREEN },
  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardCode: { fontSize: 12, color: MUTED, marginTop: 2 },
  cardMeta: { fontSize: 12, color: '#9AA0A6', marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: MUTED, marginTop: 12, textAlign: 'center' },

  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#BDBDBD',
    paddingVertical: 12,
  },
});

export default TenantsScreen;
