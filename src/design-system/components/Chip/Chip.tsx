import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import Typography from '../Typography/Typography';

type ChipVariant = 'filled' | 'outlined' | 'soft';

interface ChipProps {
  label: string;
  selected?: boolean;
  variant?: ChipVariant;
  leftIcon?: string;
  onPress?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  variant = 'soft',
  leftIcon,
  onPress,
  onRemove,
  disabled = false,
}) => {
  const { colors, spacing } = useTheme();

  const bgColor = (): string => {
    if (variant === 'filled') return selected ? colors.primary : colors.surfaceVariant;
    if (variant === 'outlined') return 'transparent';
    return selected ? colors.primaryContainer : colors.surfaceVariant;
  };

  const textColor = (): string => {
    if (variant === 'filled') return selected ? colors.onPrimary : colors.textSecondary;
    if (variant === 'outlined') return selected ? colors.primary : colors.textSecondary;
    return selected ? colors.primary : colors.textSecondary;
  };

  const borderColor = variant === 'outlined' ? (selected ? colors.primary : colors.border) : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || (!onPress && !onRemove)}
      activeOpacity={0.75}
      style={[
        styles.chip,
        {
          backgroundColor: bgColor(),
          borderColor,
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderRadius: radius.full,
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      {leftIcon && (
        <Icon name={leftIcon} size={14} color={textColor()} style={{ marginRight: 4 }} />
      )}

      <Typography preset="labelSm" style={{ color: textColor() }}>
        {label}
      </Typography>

      {onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Icon name="close" size={14} color={textColor()} style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
});

export default Chip;
