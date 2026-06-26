import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton — shimmer placeholder for loading states.
 * Replaces LoadingSpinner in list items and cards where layout is known.
 *
 * Usage:
 *   <Skeleton width="100%" height={16} />     // text line
 *   <Skeleton width={44} height={44} borderRadius={22} />  // avatar circle
 */
const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? 0.3 : 0.15, isDark ? 0.6 : 0.35],
  });

  const baseColor = isDark ? '#FFFFFF' : colors.textPrimary;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
};

/** Pre-composed skeleton for a standard list item row */
export const ListItemSkeleton: React.FC = () => (
  <View style={skeletonStyles.row}>
    <Skeleton width={44} height={44} borderRadius={22} />
    <View style={skeletonStyles.info}>
      <Skeleton width="60%" height={14} />
      <Skeleton width="40%" height={11} />
      <Skeleton width="30%" height={18} borderRadius={9} />
    </View>
  </View>
);

/** Pre-composed skeleton for a metric card */
export const CardSkeleton: React.FC = () => (
  <View style={skeletonStyles.card}>
    <Skeleton width="40%" height={12} />
    <Skeleton width="60%" height={28} />
    <Skeleton width="30%" height={10} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: { overflow: 'hidden' },
});

const skeletonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  info: { flex: 1, gap: 6 },
  card: { padding: 16, gap: 10 },
});

export default Skeleton;
