import React from 'react';
import type { StatusBarStyle } from 'react-native';
import { StatusBar as RNStatusBar } from 'react-native';

import { useTheme } from '../../theme';

interface AppStatusBarProps {
  /** Defaults to the correct style for the active theme */
  style?: StatusBarStyle;
  backgroundColor?: string;
  translucent?: boolean;
}

/**
 * AppStatusBar — thin themed wrapper around React Native's StatusBar.
 * Mount once in the screen root or App.tsx — not inside lists/scrollviews.
 */
const AppStatusBar: React.FC<AppStatusBarProps> = ({
  style,
  backgroundColor,
  translucent = false,
}) => {
  const { colors, isDark } = useTheme();
  const barStyle: StatusBarStyle = style ?? (isDark ? 'light-content' : 'dark-content');
  const bg = backgroundColor ?? colors.background;

  return (
    <RNStatusBar
      barStyle={barStyle}
      backgroundColor={bg}
      translucent={translucent}
    />
  );
};

export default AppStatusBar;
