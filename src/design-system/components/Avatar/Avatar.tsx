import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import Typography from '../Typography/Typography';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name?: string;
  imageUri?: string;
  size?: AvatarSize;
  backgroundColor?: string;
  textColor?: string;
}

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
};

const FONT_SIZE: Record<AvatarSize, number> = {
  xs: 11,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
};

/**
 * Avatar — initials fallback with optional image.
 * Derives initials from the first two words of `name`.
 *
 * Usage:
 *   <Avatar name="Ramesh Kumar" size="md" />
 *   <Avatar name="Farm Owner" imageUri={user.avatarUrl} size="lg" />
 */
const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUri,
  size = 'md',
  backgroundColor,
  textColor,
}) => {
  const { colors } = useTheme();

  const px = SIZE_PX[size];
  const fontSize = FONT_SIZE[size];
  const bg = backgroundColor ?? colors.primaryContainer;
  const tc = textColor ?? colors.primary;

  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w.charAt(0).toUpperCase())
        .join('')
    : '?';

  return (
    <View
      style={[
        styles.container,
        { width: px, height: px, borderRadius: px / 2, backgroundColor: bg },
      ]}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: px, height: px, borderRadius: px / 2 }}
        />
      ) : (
        <Typography style={{ fontSize, fontWeight: '700', color: tc }}>{initials}</Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default Avatar;
