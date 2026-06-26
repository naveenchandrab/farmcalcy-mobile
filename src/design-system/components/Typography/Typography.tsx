import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '../../theme';
import type { TextPreset } from '../../tokens/typography';

interface TypographyProps extends TextProps {
  preset?: TextPreset;
  color?: string;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
}

/**
 * Typography — base text primitive for the entire design system.
 * Use a named preset instead of styling Text directly in screens.
 *
 * Usage:
 *   <Typography preset="headingMd">Farm Details</Typography>
 *   <Typography preset="bodyMd" color={colors.textSecondary}>Created 01 Jan 2024</Typography>
 */
const Typography: React.FC<TypographyProps> = ({
  preset = 'bodyMd',
  color,
  align,
  style,
  children,
  ...rest
}) => {
  const { text, colors } = useTheme();
  const presetStyle = text[preset];

  return (
    <Text
      style={[
        presetStyle,
        { color: color ?? colors.textPrimary },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Typography;
