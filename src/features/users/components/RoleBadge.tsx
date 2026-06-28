import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { UserRole } from '@app-types';
import { ROLE_LABELS } from '@constants';
import { Typography } from '@design-system';

interface RoleBadgeProps {
  role: UserRole;
}

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  SAAS_ADMIN: { bg: '#E3F2FD', text: '#1565C0' },
  TENANT_ADMIN: { bg: '#E8F5E9', text: '#1B3D1B' },
  SUPERVISOR: { bg: '#FFF8E1', text: '#F57F17' },
  FARMER: { bg: '#F3E5F5', text: '#6A1B9A' },
};

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const { bg, text } = ROLE_COLORS[role] ?? ROLE_COLORS.FARMER;

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Typography preset="labelSm" style={[styles.label, { color: text }]}>
        {ROLE_LABELS[role] ?? role}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});

export default RoleBadge;
