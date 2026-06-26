import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme, Typography } from '@design-system';
import StatusBadge from '@components/StatusBadge';
import type { User } from '@app-types';

import RoleBadge from './RoleBadge';

interface UserListItemProps {
  user: User;
  onPress: () => void;
}

/**
 * A single row in the User List screen.
 * Shows avatar initial, name, email, role badge, and status badge.
 */
const UserListItem: React.FC<UserListItemProps> = ({ user, onPress }) => {
  const { colors } = useTheme();
  const initial = user.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
        <Typography preset="bodyLg" style={[styles.initial, { color: colors.primary }]}>
          {initial}
        </Typography>
      </View>

      <View style={styles.info}>
        <Typography preset="bodyLg" style={[styles.name, { color: colors.textPrimary }]}>
          {user.name}
        </Typography>
        <Typography preset="bodySm" style={{ color: colors.textSecondary }}>
          {user.email}
        </Typography>
        <View style={styles.badges}>
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
        </View>
      </View>

      <Icon name="chevron-right" size={20} color={colors.textDisabled} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontSize: 18,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontWeight: '600',
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
});

export default UserListItem;
