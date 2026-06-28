import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AUTH_COLORS, AUTH_FONT, AUTH_TYPE } from './authTokens';

interface CheckboxProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  label: string;
  /** Stable id for unit tests and Maestro E2E flows. */
  testID?: string;
}

/**
 * Square checkbox + label.
 * Unchecked: bordered box. Checked: filled green box with a white tick.
 */
const Checkbox: React.FC<CheckboxProps> = ({ value, onValueChange, label, testID }) => {
  const toggle = useCallback(() => onValueChange(!value), [value, onValueChange]);

  return (
    <TouchableOpacity
      testID={testID}
      onPress={toggle}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.container}
    >
      <View style={[styles.box, value ? styles.boxChecked : styles.boxUnchecked]}>
        {value && <Icon name="check" size={16} color={AUTH_COLORS.white} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  boxUnchecked: {
    borderColor: AUTH_COLORS.inputBorder,
    backgroundColor: AUTH_COLORS.white,
  },
  boxChecked: {
    borderColor: AUTH_COLORS.primary,
    backgroundColor: AUTH_COLORS.primary,
  },
  label: {
    marginLeft: 10,
    fontSize: AUTH_TYPE.register,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
});

export default memo(Checkbox);
