import React, { memo, useEffect, useRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from './authTokens';

interface AuthScreenLayoutProps {
  /** Large screen heading (green). */
  title: string;
  /** Optional supporting copy under the title. */
  subtitle?: string;
  /** Shows a back chevron in the top-left when provided. */
  onBack?: () => void;
  /** Stable id applied to the screen root for tests / E2E. */
  testID?: string;
  /** Stable id for the back button. */
  backTestID?: string;
  children: React.ReactNode;
}

const ENTER_DURATION = 450;

/**
 * Shared scaffold for the secondary auth screens (Forgot / OTP / Reset /
 * Force-change). Provides:
 *  - keyboard-avoiding behaviour + dismiss-on-outside-tap
 *  - safe-area aware padding
 *  - an optional back button
 *  - an animated title / subtitle block
 *
 * Keeping this in one place guarantees the flows are visually and behaviourally
 * consistent and removes boilerplate duplication across screens.
 */
const AuthScreenLayout: React.FC<AuthScreenLayoutProps> = ({
  title,
  subtitle,
  onBack,
  testID,
  backTestID,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  // When the keyboard opens, scroll the form so the focused field and the
  // submit button (anchored at the bottom of the content) are revealed above
  // the keyboard. With Android `adjustResize` the viewport shrinks but the
  // ScrollView does not auto-scroll, so the bottom-most button would otherwise
  // stay hidden behind the keyboard.
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      // Defer to the next frame so the resize has settled before scrolling.
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    return () => sub.remove();
  }, []);

  return (
    <KeyboardAvoidingView
      testID={testID}
      style={styles.flex}
      // Android 15 (API 35) forces edge-to-edge, so the system no longer honours
      // `adjustResize` — the keyboard overlays the content instead of shrinking
      // it. KeyboardAvoidingView must therefore actively shrink the view on
      // Android too ('height'), not just iOS ('padding'); the `scrollToEnd`
      // effect then lifts the submit button above the keyboard.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {onBack && (
        <TouchableOpacity
          testID={backTestID}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.backButton, { top: insets.top + 8 }]}
        >
          <Icon name="arrow-left" size={26} color={AUTH_COLORS.textPrimary} />
        </TouchableOpacity>
      )}

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + (onBack ? 64 : 32),
              paddingBottom: insets.bottom + 24,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.duration(ENTER_DURATION)}
            style={styles.header}
          >
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </Animated.View>

          <View style={styles.body}>{children}</View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: AUTH_COLORS.background,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: AUTH_SPACING.screenHorizontal,
  },
  header: {
    marginBottom: AUTH_SPACING.welcomeToUsername,
  },
  title: {
    fontSize: AUTH_TYPE.heading,
    fontFamily: AUTH_FONT.bold,
    color: AUTH_COLORS.primary,
  },
  subtitle: {
    marginTop: 10,
    fontSize: AUTH_TYPE.subheading,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
    lineHeight: 24,
  },
  body: {
    // Intentionally NOT flex:1. Several screens place a `spacer: { flex: 1 }`
    // after their submit button to push it down on tall screens; if this body
    // stretched, that spacer would expand to keep the content exactly the
    // viewport height, making the ScrollView un-scrollable. Leaving the body at
    // its natural height lets the content grow past the (keyboard-shrunk)
    // viewport so `scrollToEnd` can lift the button above the keyboard.
  },
});

export default memo(AuthScreenLayout);
