import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@design-system';
import Typography from '@design-system/components/Typography';

type StatusVariant = 'active' | 'inactive' | 'suspended' | 'pending' | 'expired' | 'trial' | 'paid';

interface StatusBadgeProps {
  status: string | null | undefined;
  variant?: StatusVariant;
}

const STATUS_MAP: Record<string, StatusVariant> = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  TRIAL: 'trial',
  EXPIRED: 'expired',
  PENDING: 'pending',
  PAID: 'paid',
  UNPAID: 'pending',
};

const DISPLAY_LABEL: Record<StatusVariant, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  pending: 'Pending',
  expired: 'Expired',
  trial: 'Trial',
  paid: 'Paid',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant }) => {
  const { colors } = useTheme();
  // Guard against undefined/non-string status: a presentational badge must
  // never crash the screen if the backend omits or renames the field.
  const key = typeof status === 'string' ? status.toUpperCase() : '';
  const resolved: StatusVariant = variant ?? STATUS_MAP[key] ?? 'inactive';

  const statusColors = colors.status[resolved] ?? colors.status.inactive;
  const label = DISPLAY_LABEL[resolved];

  return (
    <View style={[styles.pill, { backgroundColor: statusColors.bg }]}>
      <Typography preset="labelSm" style={{ color: statusColors.text, fontWeight: '600' }}>
        {label}
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
});

export default StatusBadge;
