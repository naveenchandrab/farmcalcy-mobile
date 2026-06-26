import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../theme';
import Typography from '../Typography/Typography';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const THUMB_SIZE = 20;
const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 24;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - 4; // 20

const Switch: React.FC<SwitchProps> = ({ value, onValueChange, label, disabled = false }) => {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(value ? TRAVEL : 0)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? TRAVEL : 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  }, [value, translateX]);

  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.85}
      style={[styles.row, disabled && styles.disabled]}
    >
      {label && (
        <Typography
          preset="bodyMd"
          style={{ flex: 1, color: colors.textPrimary, marginRight: 12 }}
        >
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.track,
          { backgroundColor: value ? colors.primary : colors.surfaceVariant },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.onPrimary,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default Switch;
