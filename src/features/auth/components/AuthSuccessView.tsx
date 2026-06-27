import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import AuthButton from './AuthButton';
import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from './authTokens';

interface AuthSuccessViewProps {
  title: string;
  message: string;
  /** Primary CTA label (e.g. "Back to Login"). */
  ctaLabel: string;
  onCtaPress: () => void;
}

/**
 * Full-screen confirmation shown after a successful password reset.
 * A clear terminal state (icon + message + single CTA) so the user always
 * knows the outcome and the one action available next.
 */
const AuthSuccessView: React.FC<AuthSuccessViewProps> = ({
  title,
  message,
  ctaLabel,
  onCtaPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.duration(350)} style={styles.iconCircle}>
          <Icon name="check-bold" size={48} color={AUTH_COLORS.white} />
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(150).duration(350)} style={styles.title}>
          {title}
        </Animated.Text>

        <Animated.Text entering={FadeIn.delay(250).duration(350)} style={styles.message}>
          {message}
        </Animated.Text>
      </View>

      <AuthButton label={ctaLabel} onPress={onCtaPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AUTH_COLORS.background,
    paddingHorizontal: AUTH_SPACING.screenHorizontal,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: AUTH_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AUTH_COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  title: {
    marginTop: 28,
    fontSize: AUTH_TYPE.heading,
    fontFamily: AUTH_FONT.bold,
    color: AUTH_COLORS.primary,
    textAlign: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: AUTH_TYPE.subheading,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default memo(AuthSuccessView);
