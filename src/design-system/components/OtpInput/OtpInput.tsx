import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type TextInput as RNTextInput,
} from 'react-native';

import { useTheme } from '../../theme';
import { radius } from '../../tokens/radius';
import Typography from '../Typography/Typography';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string;
  autoFocus?: boolean;
}

/**
 * OtpInput — 6-cell digit input with:
 *  • Auto-advance to next cell on digit entry
 *  • Auto-backspace to previous cell on delete
 *  • Paste support (fills all cells from clipboard)
 *  • Error state (red border on all cells)
 *
 * Usage:
 *   <OtpInput length={6} value={otp} onChange={setOtp} />
 */
const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  errorMessage,
  autoFocus = true,
}) => {
  const { colors, font } = useTheme();
  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);

  const digits = value.split('').slice(0, length);

  const handleKeyPress = (index: number, key: string): void => {
    if (key === 'Backspace') {
      if (digits[index]) {
        // Clear current cell
        const newValue = value.slice(0, index) + value.slice(index + 1);
        onChange(newValue);
      } else if (index > 0) {
        // Move to previous cell and clear it
        const newValue = value.slice(0, index - 1) + value.slice(index);
        onChange(newValue);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleChange = (index: number, text: string): void => {
    // Handle paste — text length > 1
    if (text.length > 1) {
      const digitsOnly = text.replace(/\D/g, '').slice(0, length);
      onChange(digitsOnly);
      const nextIndex = Math.min(digitsOnly.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '');
    if (!digit) {
      return;
    }

    const newValue = value.slice(0, index) + digit + value.slice(index + 1);
    onChange(newValue.slice(0, length));

    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const hasError = Boolean(errorMessage);

  return (
    <View>
      <View style={styles.row}>
        {Array.from({ length }).map((_, index) => {
          const isFilled = Boolean(digits[index]);
          const isFocused = focusedIndex === index;
          const borderColor = hasError
            ? colors.error
            : isFocused
            ? colors.borderFocus
            : isFilled
            ? colors.primary
            : colors.border;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => inputRefs.current[index]?.focus()}
              activeOpacity={1}
              style={[
                styles.cell,
                {
                  borderColor,
                  borderWidth: isFocused || hasError ? 2 : 1,
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                },
              ]}
            >
              <TextInput
                ref={el => {
                  inputRefs.current[index] = el;
                }}
                value={digits[index] ?? ''}
                onChangeText={text => handleChange(index, text)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                maxLength={length} // allows paste detection
                autoFocus={autoFocus && index === 0}
                style={[
                  styles.cellText,
                  { color: colors.textPrimary, fontSize: font.size['2xl'], fontWeight: font.weight.bold },
                ]}
                caretHidden
                selectTextOnFocus
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {hasError && (
        <Typography
          preset="bodySm"
          color={colors.error}
          style={styles.error}
        >
          {errorMessage}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    textAlign: 'center',
    padding: 0,
    width: '100%',
    height: '100%',
    textAlignVertical: 'center',
  },
  error: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default OtpInput;
