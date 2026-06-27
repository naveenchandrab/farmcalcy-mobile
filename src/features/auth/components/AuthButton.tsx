import React, { memo, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type GestureResponderEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from './authTokens';

interface AuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Primary CTA button.
 *
 *  - Height 56, radius 14, background #0B7A3E
 *  - White, bold, centered label
 *  - Pressed-state opacity animation (Reanimated)
 *  - Inline activity indicator while loading
 */
const AuthButton: React.FC<AuthButtonProps> = ({ label, onPress, loading = false, disabled = false }) => {
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const handlePressIn = useCallback(() => {
    opacity.value = withTiming(0.85, { duration: 100 });
  }, [opacity]);

  const handlePressOut = useCallback(() => {
    opacity.value = withTiming(1, { duration: 150 });
  }, [opacity]);

  const handlePress = useCallback(
    (_e: GestureResponderEvent) => {
      if (loading || disabled) {
        return;
      }
      onPress();
    },
    [loading, disabled, onPress],
  );

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading || disabled, busy: loading }}
      style={[styles.button, disabled && styles.disabled, animatedStyle]}
    >
      {loading ? (
        <ActivityIndicator color={AUTH_COLORS.white} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: AUTH_SPACING.buttonHeight,
    borderRadius: AUTH_SPACING.buttonRadius,
    backgroundColor: AUTH_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Medium shadow
    shadowColor: AUTH_COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    fontSize: AUTH_TYPE.button,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.white,
  },
});

export default memo(AuthButton);
