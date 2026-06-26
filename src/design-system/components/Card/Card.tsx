import React from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import type { ShadowKey } from '../../tokens/shadows';
import { spacing } from '../../tokens/spacing';

interface CardProps extends ViewProps {
  elevation?: ShadowKey;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  children: React.ReactNode;
}

const PADDING_MAP = {
  none: 0,
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[5],
} as const;

/**
 * Card — elevated surface container.
 *
 * Usage:
 *   <Card elevation="sm" padding="md">
 *     <Typography preset="headingSm">Cycle #7</Typography>
 *   </Card>
 */
const Card: React.FC<CardProps> = ({
  elevation = 'sm',
  padding = 'md',
  style,
  children,
  ...rest
}) => {
  const { colors, shadows } = useTheme();

  return (
    <View
      style={[
        styles.card,
        shadows[elevation],
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: PADDING_MAP[padding],
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
});

export default Card;
