import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';

type IconButtonVariant = 'ghost' | 'soft' | 'outlined';
type IconButtonSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<IconButtonSize, { container: number; icon: number }> = {
  sm: { container: 32, icon: 16 },
  md: { container: 40, icon: 20 },
  lg: { container: 48, icon: 24 },
};

interface IconButtonProps {
  name: string;
  onPress: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  color?: string;
  disabled?: boolean;
  style?: ViewStyle;
  hitSlop?: number;
}

const IconButton: React.FC<IconButtonProps> = ({
  name,
  onPress,
  variant = 'ghost',
  size = 'md',
  color,
  disabled = false,
  style,
  hitSlop = 8,
}) => {
  const { colors } = useTheme();
  const { container, icon } = SIZE_MAP[size];

  const iconColor = color ?? (disabled ? colors.textDisabled : colors.textSecondary);

  const bg = (): string => {
    if (variant === 'soft') return colors.surfaceVariant;
    if (variant === 'outlined') return 'transparent';
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      hitSlop={{ top: hitSlop, bottom: hitSlop, left: hitSlop, right: hitSlop }}
      style={[
        styles.base,
        {
          width: container,
          height: container,
          borderRadius: radius.full,
          backgroundColor: bg(),
          borderWidth: variant === 'outlined' ? 1 : 0,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Icon name={name} size={icon} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;
