import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { OTP_LENGTH } from '@constants';

import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING } from './authTokens';

interface AuthOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired once the final digit is entered (enables auto-submit). */
  onComplete?: (value: string) => void;
  errorMessage?: string;
  /** Disables editing (e.g. while verifying). */
  editable?: boolean;
  length?: number;
  autoFocus?: boolean;
  /** Base id; each cell is exposed as `${testID}-${index}` for tests / E2E. */
  testID?: string;
}

/**
 * Segmented OTP input matching the auth design language.
 *
 *  - One cell per digit, auto-advance on entry, auto-backspace on delete
 *  - Full paste support (fills every cell from a pasted code)
 *  - Numeric keypad, digit-only filtering
 *  - Error state (red borders) and `onComplete` for auto-submit
 *  - Accessible: each cell is labelled; the group exposes its progress
 */
const AuthOtpInput: React.FC<AuthOtpInputProps> = ({
  value,
  onChange,
  onComplete,
  errorMessage,
  editable = true,
  length = OTP_LENGTH,
  autoFocus = true,
  testID,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null,
  );

  const digits = value.split('').slice(0, length);
  const hasError = Boolean(errorMessage);

  // Fire onComplete exactly once when the code reaches full length.
  const completedRef = useRef(false);
  useEffect(() => {
    if (value.length === length && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(value);
    } else if (value.length < length) {
      completedRef.current = false;
    }
  }, [value, length, onComplete]);

  const handleChange = useCallback(
    (index: number, text: string): void => {
      // Paste — multiple characters arrive at once.
      if (text.length > 1) {
        const pasted = text.replace(/\D/g, '').slice(0, length);
        onChange(pasted);
        const nextIndex = Math.min(pasted.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
        return;
      }

      const digit = text.replace(/\D/g, '');
      if (!digit) {
        return;
      }

      const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(
        0,
        length,
      );
      onChange(next);

      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [length, onChange, value],
  );

  const handleKeyPress = useCallback(
    (index: number, key: string): void => {
      if (key !== 'Backspace') {
        return;
      }
      if (digits[index]) {
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        onChange(value.slice(0, index - 1) + value.slice(index));
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits, onChange, value],
  );

  return (
    <View>
      <View
        style={styles.row}
        accessibilityRole="none"
        accessibilityLabel={`One-time passcode, ${value.length} of ${length} digits entered`}
      >
        {Array.from({ length }).map((_, index) => {
          const isFilled = Boolean(digits[index]);
          const isFocused = focusedIndex === index;
          const borderColor = hasError
            ? AUTH_COLORS.error
            : isFocused
            ? AUTH_COLORS.inputBorderFocus
            : isFilled
            ? AUTH_COLORS.primary
            : AUTH_COLORS.inputBorder;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={1}
              onPress={() => inputRefs.current[index]?.focus()}
              style={[
                styles.cell,
                { borderColor, borderWidth: isFocused || hasError ? 2 : 1.5 },
              ]}
            >
              <TextInput
                testID={testID ? `${testID}-${index}` : undefined}
                ref={el => {
                  inputRefs.current[index] = el;
                }}
                value={digits[index] ?? ''}
                onChangeText={text => handleChange(index, text)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                importantForAutofill="yes"
                maxLength={length}
                editable={editable}
                autoFocus={autoFocus && index === 0}
                selectTextOnFocus
                caretHidden
                style={styles.cellText}
                accessibilityLabel={`Digit ${index + 1}`}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {hasError ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    maxWidth: 56,
    height: 60,
    marginHorizontal: 4,
    borderRadius: AUTH_SPACING.inputRadius,
    backgroundColor: AUTH_COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    padding: 0,
    fontSize: 24,
    fontFamily: AUTH_FONT.semibold,
    color: AUTH_COLORS.textPrimary,
  },
  error: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.error,
    textAlign: 'center',
  },
});

export default memo(AuthOtpInput);
