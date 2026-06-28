import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';

interface AppSafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** Which edges to apply safe area padding to */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * AppSafeAreaView — safe area wrapper with automatic background color from theme.
 * Uses react-native-safe-area-context (not the deprecated RN built-in).
 *
 * Most screens should use edges={['top']} since the bottom tab bar handles
 * the bottom safe area.
 */
const AppSafeAreaView: React.FC<AppSafeAreaViewProps> = ({
  children,
  style,
  edges = ['top', 'left', 'right'],
}) => {
  const { colors } = useTheme();

  return (
    <RNSafeAreaView
      edges={edges}
      style={[styles.base, { backgroundColor: colors.background }, style]}
    >
      {children}
    </RNSafeAreaView>
  );
};

const styles = StyleSheet.create({
  base: { flex: 1 },
});

export default AppSafeAreaView;
