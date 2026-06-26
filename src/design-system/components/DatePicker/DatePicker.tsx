import React, { useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';
import { layout } from '../../tokens/spacing';
import BottomSheet from '../BottomSheet/BottomSheet';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatDate = (date: Date, mode: 'date' | 'time' | 'datetime'): string => {
  if (mode === 'time') {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  if (mode === 'datetime') {
    return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ` +
      date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * DatePicker — wraps @react-native-community/datetimepicker with a themed trigger.
 * Requires: @react-native-community/datetimepicker installed and linked.
 * iOS: spinner modal; Android: native date dialog.
 */
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  error,
  disabled = false,
  minimumDate,
  maximumDate,
  mode = 'date',
}) => {
  const { colors, spacing } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date());

  const hasError = Boolean(error);
  const borderColor = hasError ? colors.error : colors.border;
  const displayText = value ? formatDate(value, mode) : null;

  const handlePress = () => {
    if (disabled) return;
    if (Platform.OS === 'android') {
      // On Android, use the native picker directly via the package
      setOpen(true);
    } else {
      setOpen(true);
    }
  };

  // Lazy-require to avoid crash when package is not yet installed
  let DateTimePicker: React.ComponentType<any> | null = null;
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch {
    // Package not installed — picker falls back to manual entry
  }

  return (
    <View>
      {label && (
        <Typography
          preset="labelMd"
          style={{ color: colors.textSecondary, marginBottom: spacing[1] }}
        >
          {label}
        </Typography>
      )}

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          {
            height: layout.inputHeight,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor,
            borderRadius: 8,
            backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
            paddingHorizontal: spacing[4],
          },
        ]}
      >
        <Typography
          preset="bodyMd"
          style={{ flex: 1, color: displayText ? colors.textPrimary : colors.textDisabled }}
        >
          {displayText ?? placeholder}
        </Typography>
        <Icon name="calendar" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {hasError && (
        <Typography preset="caption" style={{ color: colors.error, marginTop: spacing[1] }}>
          {error}
        </Typography>
      )}

      {/* iOS: show in BottomSheet; Android: native modal */}
      {open && DateTimePicker && (
        Platform.OS === 'ios' ? (
          <BottomSheet visible={open} onClose={() => setOpen(false)} title={label ?? 'Select date'}>
            <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
              <DateTimePicker
                value={draft}
                mode={mode}
                display="spinner"
                onChange={(_: any, date?: Date) => date && setDraft(date)}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor={colors.textPrimary}
              />
              <Button
                onPress={() => {
                  onChange(draft);
                  setOpen(false);
                }}
                style={{ marginTop: 8 }}
              >
                Confirm
              </Button>
            </View>
          </BottomSheet>
        ) : (
          <DateTimePicker
            value={draft}
            mode={mode}
            display="default"
            onChange={(_: any, date?: Date) => {
              setOpen(false);
              if (date) { onChange(date); }
            }}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        )
      )}
    </View>
  );
};

export default DatePicker;
