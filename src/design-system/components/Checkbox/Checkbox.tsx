import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import Typography from '../Typography/Typography';

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  error = false,
}) => {
  const { colors } = useTheme();

  const borderColor = error ? colors.error : value ? colors.primary : colors.border;
  const bg = value ? colors.primary : 'transparent';

  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.8}
      style={[styles.row, disabled && styles.disabled]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor,
            backgroundColor: bg,
            borderRadius: radius.sm,
          },
        ]}
      >
        {value && <Icon name="check" size={14} color={colors.onPrimary} />}
      </View>

      {label && (
        <Typography
          preset="bodyMd"
          style={{ color: colors.textPrimary, marginLeft: 10, flexShrink: 1 }}
        >
          {label}
        </Typography>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  disabled: { opacity: 0.4 },
  box: {
    width: 20,
    height: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Checkbox;
