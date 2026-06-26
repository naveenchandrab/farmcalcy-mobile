import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme';
import { zIndex } from '../../tokens/zIndex';
import Typography from '../Typography/Typography';

interface LoadingSpinnerProps {
  /** Full-screen blocking overlay */
  overlay?: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

/**
 * LoadingSpinner — inline or full-screen loading indicator.
 *
 * Usage:
 *   <LoadingSpinner />                        // inline, centred in parent
 *   <LoadingSpinner overlay message="Saving…" /> // blocks the screen
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  overlay = false,
  message,
  size = 'large',
  color,
}) => {
  const { colors } = useTheme();
  const spinnerColor = color ?? colors.primary;

  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Typography preset="bodyMd" color={overlay ? '#FFFFFF' : colors.textSecondary} style={styles.message}>
          {message}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
    zIndex: zIndex.overlay,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
