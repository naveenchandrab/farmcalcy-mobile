import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
  type TextInputProps as RNTextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '../../theme';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  /** Character count shown bottom-right when set */
  maxLength?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * TextInput — outlined text field with label, helper text, error state,
 * left/right adornments, and optional character counter.
 *
 * Usage:
 *   <TextInput
 *     label="Email"
 *     leftIcon="email-outline"
 *     value={value}
 *     onChangeText={onChange}
 *     errorMessage={errors.email?.message}
 *   />
 */
const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      helperText,
      errorMessage,
      leftIcon,
      rightIcon,
      onRightIconPress,
      maxLength,
      containerStyle,
      value = '',
      style,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const { colors, radius: r, font } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const hasError = Boolean(errorMessage);
    const borderColor = hasError
      ? colors.error
      : isFocused
      ? colors.borderFocus
      : colors.border;

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: hasError ? colors.error : isFocused ? colors.borderFocus : colors.textSecondary,
                fontSize: font.size.sm,
                fontWeight: font.weight.medium,
              },
            ]}
          >
            {label}
          </Text>
        )}

        <View
          style={[
            styles.inputContainer,
            {
              borderColor,
              borderRadius: r.md,
              backgroundColor: colors.surface,
              borderWidth: isFocused || hasError ? 1.5 : 1,
            },
          ]}
        >
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={18}
              color={isFocused ? colors.borderFocus : colors.textSecondary}
              style={styles.leftIcon}
            />
          )}

          <RNTextInput
            ref={ref}
            value={value}
            maxLength={maxLength}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                fontSize: font.size.md,
                flex: 1,
              },
              style,
            ]}
            placeholderTextColor={colors.textDisabled}
            onFocus={e => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={e => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              style={styles.rightIcon}
            >
              <Icon name={rightIcon} size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          {(hasError || helperText) && (
            <Text
              style={[
                styles.helperText,
                { color: hasError ? colors.error : colors.textSecondary, fontSize: font.size.xs },
              ]}
            >
              {hasError ? errorMessage : helperText}
            </Text>
          )}
          {maxLength && (
            <Text style={[styles.charCount, { color: colors.textDisabled, fontSize: font.size.xs }]}>
              {(value).length}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    );
  },
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  label: { marginBottom: 2, marginLeft: 2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 0,
    paddingHorizontal: 4,
  },
  leftIcon: { marginRight: 8 },
  rightIcon: { marginLeft: 8, padding: 2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginLeft: 2,
  },
  helperText: { flex: 1 },
  charCount: { marginLeft: 8 },
});

export default TextInput;
