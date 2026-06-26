import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import Typography from '../Typography/Typography';

export type BadgeStatus =
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'trial'
  | 'expired'
  | 'pending'
  | 'paid'
  | 'custom';

interface BadgeProps {
  status?: BadgeStatus;
  /** Override label (defaults to capitalized status name). */
  label?: string;
  /** Used when status = 'custom'. */
  customColors?: { text: string; bg: string };
}

/**
 * Badge — status pill with automatic color mapping.
 *
 * Usage:
 *   <Badge status="active" />           → "Active" in green
 *   <Badge status="trial" />            → "Trial" in amber
 *   <Badge status="suspended" />        → "Suspended" in red
 *   <Badge status="custom" label="Broiler" customColors={{ text: '#1B3D1B', bg: '#E8F5E9' }} />
 */
const Badge: React.FC<BadgeProps> = ({ status = 'active', label, customColors }) => {
  const { colors } = useTheme();

  const colorMap = status === 'custom' && customColors
    ? customColors
    : colors.status[status === 'custom' ? 'active' : status];

  const displayLabel = label ?? (status === 'custom' ? '' : capitalize(status));

  return (
    <View style={[styles.pill, { backgroundColor: colorMap.bg, borderRadius: radius.full }]}>
      <Typography
        preset="labelSm"
        style={[styles.text, { color: colorMap.text }]}
      >
        {displayLabel}
      </Typography>
    </View>
  );
};

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    textTransform: 'capitalize',
  },
});

export default Badge;
