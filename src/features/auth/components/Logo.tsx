import React, { memo, useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { AUTH_COLORS, AUTH_FONT } from './authTokens';

const BADGE_HEIGHT = 120;
const BADGE_WIDTH = BADGE_HEIGHT * 1.088; // content aspect of the cropped logo asset

/** Small leaf that sits on the top-right of the "Calcy" wordmark. */
const LeafAccent: React.FC = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" style={styles.leafAccent}>
    <Path d="M21,3 C11,3 4,9 3,19 C3,20 4,21 5,21 C15,20 21,13 21,3 Z" fill={AUTH_COLORS.primary} />
    <Path d="M6,18 Q12,12 18,8" stroke="#FFFFFF" strokeWidth="1.1" fill="none" opacity={0.85} />
  </Svg>
);

/**
 * Brand logo block: circular FarmCalcy badge, "FarmCalcy" wordmark
 * (green + orange with a leaf accent) and the "Poultry Suite" sub-label
 * flanked by rules.
 *
 * Entrance: fade in + scale 0.95 → 1 over 500ms.
 */
const Logo: React.FC = () => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image
        source={require('@assets/images/splash-logo.png') as ImageSourcePropType}
        style={styles.badge}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="FarmCalcy logo"
      />

      <View style={styles.wordmarkRow}>
        <Text style={styles.wordFarm}>Farm</Text>
        <Text style={styles.wordCalcy}>Calcy</Text>
        <LeafAccent />
      </View>

      <View style={styles.suiteRow}>
        <View style={styles.dash} />
        <Text style={styles.suite}>Poultry Suite</Text>
        <View style={styles.dash} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    width: BADGE_WIDTH,
    height: BADGE_HEIGHT,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  wordFarm: {
    fontSize: 38,
    fontFamily: AUTH_FONT.extrabold,
    color: AUTH_COLORS.logoGreen,
    letterSpacing: -0.5,
  },
  wordCalcy: {
    fontSize: 38,
    fontFamily: AUTH_FONT.extrabold,
    color: AUTH_COLORS.orange,
    letterSpacing: -0.5,
  },
  leafAccent: {
    marginTop: 2,
    marginLeft: -2,
  },
  suiteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  dash: {
    width: 26,
    height: 1.5,
    marginHorizontal: 8,
    backgroundColor: AUTH_COLORS.logoGreen,
  },
  suite: {
    fontSize: 20,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.logoGreen,
    letterSpacing: 0.5,
  },
});

export default memo(Logo);
