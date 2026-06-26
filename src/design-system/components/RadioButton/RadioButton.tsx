import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../theme';
import Typography from '../Typography/Typography';

interface RadioOption<T extends string> {
  label: string;
  value: T;
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  disabled?: boolean;
  horizontal?: boolean;
}

function RadioGroup<T extends string>({
  options,
  value,
  onValueChange,
  disabled = false,
  horizontal = false,
}: RadioGroupProps<T>): React.ReactElement {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[
        styles.group,
        horizontal && styles.horizontal,
        { gap: horizontal ? spacing[4] : spacing[3] },
      ]}
    >
      {options.map(opt => {
        const selected = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => !disabled && onValueChange(opt.value)}
            activeOpacity={0.8}
            style={[styles.row, disabled && styles.disabled]}
          >
            <View
              style={[
                styles.outer,
                { borderColor: selected ? colors.primary : colors.border },
              ]}
            >
              {selected && (
                <View style={[styles.inner, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Typography
              preset="bodyMd"
              style={{ color: colors.textPrimary, marginLeft: 10 }}
            >
              {opt.label}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { flexDirection: 'column' },
  horizontal: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row', alignItems: 'center' },
  disabled: { opacity: 0.4 },
  outer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default RadioGroup;
