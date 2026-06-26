import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import { layout } from '../../tokens/spacing';
import Typography from '../Typography/Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'financial';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  iconLeft?: string;
  iconRight?: string;
  style?: ViewStyle;
  children: React.ReactNode;
}

const SIZE_HEIGHT: Record<ButtonSize, number> = {
  sm: 36,
  md: layout.buttonHeight,  // 48dp
  lg: 54,
};

const SIZE_FONT = {
  sm: 13,
  md: 15,
  lg: 16,
};

const SIZE_ICON = {
  sm: 14,
  md: 18,
  lg: 20,
};

const SIZE_PAD_H = {
  sm: 12,
  md: 20,
  lg: 24,
};

/**
 * Button — core interactive primitive.
 *
 * Variants:
 *   primary   → green fill  (headers, primary CTA)
 *   secondary → green tint  (secondary actions)
 *   outline   → green border, transparent fill
 *   ghost     → no border or fill, green text
 *   danger    → red fill    (delete, logout, deactivate)
 *   financial → amber fill  ("Make Payment")
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  style,
  disabled,
  children,
  ...rest
}) => {
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant, colors, isDisabled ?? false);
  const height = SIZE_HEIGHT[size];
  const paddingH = SIZE_PAD_H[size];
  const fontSize = SIZE_FONT[size];
  const iconSize = SIZE_ICON[size];

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles.container,
        { height, paddingHorizontal: paddingH },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.contentColor} />
      ) : (
        <View style={styles.row}>
          {iconLeft && (
            <Icon name={iconLeft} size={iconSize} color={variantStyles.contentColor} style={styles.iconLeft} />
          )}
          <Typography
            style={[
              styles.label,
              { fontSize, fontWeight: '600', color: variantStyles.contentColor },
            ]}
          >
            {children}
          </Typography>
          {iconRight && (
            <Icon name={iconRight} size={iconSize} color={variantStyles.contentColor} style={styles.iconRight} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Style helpers ────────────────────────────────────────────────────────────

type Colors = ReturnType<typeof useTheme>['colors'];

const getVariantStyles = (
  variant: ButtonVariant,
  colors: Colors,
  disabled: boolean,
): { container: ViewStyle; contentColor: string } => {
  const alpha = disabled ? '66' : 'FF';

  switch (variant) {
    case 'primary':
      return {
        container: { backgroundColor: colors.primary + alpha, borderRadius: radius.md },
        contentColor: colors.textOnPrimary,
      };
    case 'secondary':
      return {
        container: { backgroundColor: colors.primaryContainer, borderRadius: radius.md },
        contentColor: colors.primary,
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: colors.primary,
        },
        contentColor: colors.primary,
      };
    case 'ghost':
      return {
        container: { backgroundColor: 'transparent', borderRadius: radius.md },
        contentColor: colors.primary,
      };
    case 'danger':
      return {
        container: { backgroundColor: colors.error + alpha, borderRadius: radius.md },
        contentColor: '#FFFFFF',
      };
    case 'financial':
      return {
        container: { backgroundColor: colors.financial + alpha, borderRadius: radius.md },
        contentColor: '#FFFFFF',
      };
  }
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.55 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { letterSpacing: 0.3 },
  iconLeft: { marginRight: 6 },
  iconRight: { marginLeft: 6 },
});

export default Button;
