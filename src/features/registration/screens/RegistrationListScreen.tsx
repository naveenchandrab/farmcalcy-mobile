import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ScreenHeader from '@navigation/ScreenHeader';
import type { RegistrationsStackParamList } from '@navigation/types';

import { useRegistrationList } from '../hooks/useRegistrationReview';
import { REGISTRATION_TYPE_LABEL } from '../types';
import type { RegistrationResponse, RegistrationStatus } from '../types';

const GREEN = '#1E8038';
const RED = '#D32F2F';
const MUTED = '#7A7A7A';

const STATUS_BADGE: Record<RegistrationStatus, { text: string; bg: string; label: string }> = {
  PENDING: { text: '#B26A00', bg: '#FFF8E1', label: 'Pending' },
  APPROVED: { text: '#2E7D32', bg: '#E8F5E9', label: 'Approved' },
  REJECTED: { text: RED, bg: '#FFEBEE', label: 'Rejected' },
};

const TABS: { key: RegistrationStatus; label: string }[] = [
  { key: 'PENDING', label: 'Pending' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

type Nav = NativeStackNavigationProp<RegistrationsStackParamList, 'RegistrationApprovalList'>;

const RegistrationListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [status, setStatus] = useState<RegistrationStatus>('PENDING');
  const { data, isLoading, isRefetching, refetch } = useRegistrationList({ status });

  const renderItem = useCallback(
    ({ item }: { item: RegistrationResponse }) => {
      const badge = STATUS_BADGE[item.status];
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('RegistrationApprovalDetail', { id: item.id })}
          style={styles.card}
          accessibilityRole="button"
          accessibilityLabel={`${item.firstName} ${item.lastName}`}
        >
          <View style={styles.cardIcon}>
            <Icon name="account-clock-outline" size={22} color={GREEN} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.cardName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.cardMeta} numberOfLines={1}>
              {REGISTRATION_TYPE_LABEL[item.requestType]}
              {item.companyName ? ` · ${item.companyName}` : ''}
            </Text>
            <Text style={styles.cardContact} numberOfLines={1}>
              {item.email ?? item.phoneNumber}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation],
  );

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Registration Approvals" variant="back" />

      <View style={styles.tabs}>
        {TABS.map(tab => {
          const active = tab.key === status;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setStatus(tab.key)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

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
              <Icon name="clipboard-text-outline" size={48} color="#C4C9C4" />
              <Text style={styles.emptyText}>
                No {STATUS_BADGE[status].label.toLowerCase()} requests.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F7F9F7' },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E6E6',
  },
  tab: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 16, backgroundColor: '#F1F5F1' },
  tabActive: { backgroundColor: '#E7F4E9' },
  tabText: { fontSize: 13, fontWeight: '600', color: MUTED },
  tabTextActive: { color: GREEN },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { flexGrow: 1, padding: 16, gap: 12 },
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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
  cardMeta: { fontSize: 13, color: MUTED, marginTop: 2 },
  cardContact: { fontSize: 12, color: '#9AA0A6', marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: MUTED, marginTop: 12 },
});

export default RegistrationListScreen;
