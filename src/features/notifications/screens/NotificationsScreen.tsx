import { useNavigation } from '@react-navigation/native';
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

import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../types';

const GREEN = '#1E8038';
const AMBER = '#F9A825';
const RED = '#D32F2F';
const TEXT = '#1A1A1A';
const MUTED = '#7A7A7A';

const TYPE_ICON: Record<NotificationType, { icon: string; color: string }> = {
  REGISTRATION_SUBMITTED: { icon: 'account-plus-outline', color: AMBER },
  REGISTRATION_APPROVED: { icon: 'check-circle-outline', color: GREEN },
  REGISTRATION_REJECTED: { icon: 'close-circle-outline', color: RED },
};

const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, isLoading, isRefetching, refetch } = useNotifications(unreadOnly);
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const onPressItem = useCallback(
    (item: AppNotification) => {
      if (!item.read) {
        markRead(item.id);
      }
      // Deep-link into the relevant approval when the payload carries a registration id.
      const registrationId = item.data?.registrationId;
      if (typeof registrationId === 'string') {
        navigation.navigate(
          'RegistrationsTab' as never,
          { screen: 'RegistrationApprovalDetail', params: { id: registrationId } } as never,
        );
      }
    },
    [markRead, navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => {
      const meta = TYPE_ICON[item.type] ?? { icon: 'bell-outline', color: GREEN };
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onPressItem(item)}
          style={styles.row}
          accessibilityRole="button"
          accessibilityLabel={item.title}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${meta.color}1A` }]}>
            <Icon name={meta.icon} size={22} color={meta.color} />
          </View>
          <View style={styles.body}>
            <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.body}
            </Text>
            <Text style={styles.time}>{formatTimestamp(item.createdAt)}</Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      );
    },
    [onPressItem],
  );

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Notifications" variant="back" />

      <View style={styles.tabsRow}>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, !unreadOnly && styles.tabActive]}
            onPress={() => setUnreadOnly(false)}
          >
            <Text style={[styles.tabText, !unreadOnly && styles.tabTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, unreadOnly && styles.tabActive]}
            onPress={() => setUnreadOnly(true)}
          >
            <Text style={[styles.tabText, unreadOnly && styles.tabTextActive]}>
              Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
            </Text>
          </TouchableOpacity>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={() => markAllRead()} accessibilityRole="button">
            <Text style={styles.markAll}>Mark all as read</Text>
          </TouchableOpacity>
        )}
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
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Icon name="bell-sleep-outline" size={48} color="#C4C9C4" />
              <Text style={styles.emptyText}>
                {unreadOnly ? 'No unread notifications.' : 'You have no notifications yet.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E6E6',
  },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#F1F5F1' },
  tabActive: { backgroundColor: '#E7F4E9' },
  tabText: { fontSize: 13, fontWeight: '600', color: MUTED },
  tabTextActive: { color: GREEN },
  markAll: { fontSize: 13, fontWeight: '600', color: GREEN },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { flexGrow: 1, paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  body: { flex: 1 },
  title: { fontSize: 15, color: TEXT, fontWeight: '500' },
  titleUnread: { fontWeight: '700' },
  message: { fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, color: '#9AA0A6', marginTop: 4 },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: GREEN,
    marginLeft: 8,
    marginTop: 6,
  },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#EEEEEE', marginLeft: 68 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 14, color: MUTED, marginTop: 12 },
});

export default NotificationsScreen;
