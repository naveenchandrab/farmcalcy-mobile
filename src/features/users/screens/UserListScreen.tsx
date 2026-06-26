import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDebouncedCallback } from 'use-debounce';

import { useTheme, Typography, Chip } from '@design-system';
import EmptyState from '@components/EmptyState';
import Loader from '@components/Loader';
import SearchBar from '@components/SearchBar';
import type { SaasAdminScreenProps } from '@navigation/types';
import type { User } from '@app-types';

import { useUserList } from '../hooks/useUsers';
import type { UserRoleFilter, UserStatusFilter } from '../types';
import UserListItem from '../components/UserListItem';

type Props = SaasAdminScreenProps<'UserList'>;

const ROLE_FILTERS: UserRoleFilter[] = ['ALL', 'SAAS_ADMIN', 'TENANT_ADMIN', 'SUPERVISOR', 'FARMER'];
const STATUS_FILTERS: UserStatusFilter[] = ['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'];

const ROLE_LABELS: Record<UserRoleFilter, string> = {
  ALL: 'All Roles',
  SAAS_ADMIN: 'SaaS Admin',
  TENANT_ADMIN: 'Company Admin',
  SUPERVISOR: 'Supervisor',
  FARMER: 'Farmer',
};

const STATUS_LABELS: Record<UserStatusFilter, string> = {
  ALL: 'All Status',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
};

/**
 * User List Screen — SAAS_ADMIN only.
 *
 * Features:
 *  • Debounced search (300 ms)
 *  • Role + status filter chips (horizontal scroll)
 *  • Paginated FlatList
 *  • Optimistic status toggle via UserDetails
 */
const UserListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('ALL');

  const debounce = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value);
  }, 300);

  const handleSearch = useCallback(
    (text: string) => {
      setSearch(text);
      debounce(text);
    },
    [debounce],
  );

  const { data, isLoading, isError, refetch } = useUserList({
    search: debouncedSearch,
    role: roleFilter,
    status: statusFilter,
    page: 1,
    limit: 20,
  });

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <UserListItem
        user={item}
        onPress={() => navigation.navigate('UserDetails', { userId: item.id })}
      />
    ),
    [navigation],
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Typography preset="headingSm" style={styles.headerTitle}>Users</Typography>
        <TouchableOpacity onPress={() => navigation.navigate('CreateUser')} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={search}
        onChangeText={handleSearch}
        placeholder="Search by name or email…"
      />

      {/* Role filter chips */}
      <FlatList
        data={ROLE_FILTERS}
        horizontal
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        renderItem={({ item }) => (
          <Chip
            label={ROLE_LABELS[item]}
            selected={roleFilter === item}
            variant="filled"
            onPress={() => setRoleFilter(item)}
          />
        )}
      />

      {/* Status filter chips */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipList, styles.chipListSmall]}
        renderItem={({ item }) => (
          <Chip
            label={STATUS_LABELS[item]}
            selected={statusFilter === item}
            variant="soft"
            onPress={() => setStatusFilter(item)}
          />
        )}
      />

      {/* List */}
      {isLoading ? (
        <Loader message="Loading users…" />
      ) : isError ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Failed to load users"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={
            (data?.items ?? []).length === 0 ? styles.flex : undefined
          }
          ListEmptyComponent={
            <EmptyState
              icon="account-group-outline"
              title="No users found"
              description={
                debouncedSearch
                  ? `No results for "${debouncedSearch}"`
                  : 'Add your first user to get started.'
              }
              actionLabel="Add User"
              onAction={() => navigation.navigate('CreateUser')}
            />
          }
          onRefresh={() => void refetch()}
          refreshing={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
  },
  headerBtn: { padding: 8 },
  headerTitle: { flex: 1, color: '#fff', textAlign: 'center' },
  chipList: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    gap: 8,
  },
  chipListSmall: {
    paddingBottom: 8,
  },
});

export default UserListScreen;
