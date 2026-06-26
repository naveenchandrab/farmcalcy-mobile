import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type ViewStyle,
} from 'react-native';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  contentStyle?: ViewStyle;
}

/**
 * Cross-platform keyboard avoiding wrapper for form screens.
 * Uses KeyboardAvoidingView + ScrollView so the form scrolls up
 * when the keyboard appears — critical on small Android devices.
 *
 * Usage: wrap any form screen's content in this component.
 */
const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  contentStyle,
}) => (
  <KeyboardAvoidingView
    style={styles.flex}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
  >
    <ScrollView
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
});

export default KeyboardAvoidingWrapper;
