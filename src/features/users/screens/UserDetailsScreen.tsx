import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  useTheme,
  Typography,
  Card,
  Divider,
  Switch,
} from '@design-system';
import ConfirmDialog from '@components/ConfirmDialog';
import Loader from '@components/Loader';
import StatusBadge from '@components/StatusBadge';
import { ROLE_LABELS } from '@constants';
import type { SaasAdminScreenProps } from '@navigation/types';

import { useToggleUserStatus, useUser } from '../hooks/useUsers';
import RoleBadge from '../components/RoleBadge';

type Props = SaasAdminScreenProps<'UserDetails'>;

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={18} color={colors.textSecondary} style={styles.detailIcon} />
      <View style={styles.detailContent}>
        <Typography preset="bodySm" style={{ color: colors.textSecondary }}>
          {label}
        </Typography>
        <Typography preset="bodyLg" style={{ color: colors.textPrimary, fontWeight: '500' }}>
          {value}
        </Typography>
      </View>
    </View>
  );
};

/**
 * User Details Screen — read-only view with role badge, status badge,
 * and an optimistic status toggle switch.
 */
const UserDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { userId } = route.params;
  const { colors } = useTheme();

  const { data: user, isLoading } = useUser(userId);
  const { mutate: toggleStatus, isPending: isToggling } = useToggleUserStatus();

  const [showStatusDialog, setShowStatusDialog] = useState(false);

  const handleStatusToggle = (): void => {
    setShowStatusDialog(true);
  };

  const confirmStatusToggle = (): void => {
    if (!user) {
      return;
    }
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    toggleStatus({ userId, status: newStatus });
    setShowStatusDialog(false);
  };

  if (isLoading) {
    return <Loader message="Loading user…" />;
  }

  if (!user) {
    return null;
  }

  const isActive = user.status === 'ACTIVE';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Typography preset="headingSm" style={styles.headerTitle}>User Details</Typography>
        <TouchableOpacity onPress={() => navigation.navigate('EditUser', { userId })} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="pencil-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar card */}
        <View style={[styles.avatarCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.avatarInitial}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.avatarName}>{user.name}</Text>
            <Text style={styles.avatarEmail}>{user.email}</Text>
            <View style={styles.badgeRow}>
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </View>
          </View>
        </View>

        {/* Detail rows */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Typography preset="bodyLg" style={{ color: colors.textPrimary, fontWeight: '600' }}>
              Profile Information
            </Typography>
          </View>
          <Divider />
          <View style={styles.cardContent}>
            <DetailRow icon="account-outline" label="Full Name" value={user.name} />
            <DetailRow icon="email-outline" label="Email Address" value={user.email} />
            {user.phone && (
              <DetailRow icon="phone-outline" label="Mobile Number" value={user.phone} />
            )}
            <DetailRow
              icon="shield-account-outline"
              label="Role"
              value={ROLE_LABELS[user.role] ?? user.role}
            />
            <DetailRow
              icon="calendar-outline"
              label="Member Since"
              value={new Date(user.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
          </View>
        </Card>

        {/* Status toggle */}
        <Card style={styles.card}>
          <View style={[styles.statusRow, { padding: 16 }]}>
            <View style={styles.statusInfo}>
              <Typography preset="bodyLg" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                Account Status
              </Typography>
              <Typography preset="bodySm" style={{ color: colors.textSecondary }}>
                {isActive ? 'User can log in and access the system' : 'User is blocked from login'}
              </Typography>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleStatusToggle}
              disabled={isToggling}
            />
          </View>
        </Card>
      </ScrollView>

      <ConfirmDialog
        visible={showStatusDialog}
        title={isActive ? 'Deactivate User' : 'Activate User'}
        message={
          isActive
            ? `Are you sure you want to deactivate ${user.name}? They will be immediately logged out.`
            : `Activate ${user.name}? They will be able to log in again.`
        }
        confirmLabel={isActive ? 'Deactivate' : 'Activate'}
        destructive={isActive}
        onConfirm={confirmStatusToggle}
        onCancel={() => setShowStatusDialog(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 8,
  },
  headerBtn: { padding: 8 },
  headerTitle: { flex: 1, color: '#fff', textAlign: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  avatarCard: { borderRadius: 16, overflow: 'hidden' },
  avatarContainer: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16, gap: 8 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 30, fontWeight: '800', color: '#fff' },
  avatarName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  avatarEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  card: { borderRadius: 12 },
  cardHeader: { padding: 16, paddingBottom: 12 },
  cardContent: { padding: 16, gap: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailIcon: { marginTop: 2 },
  detailContent: { flex: 1, gap: 2 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  statusInfo: { flex: 1, gap: 2 },
});

export default UserDetailsScreen;
