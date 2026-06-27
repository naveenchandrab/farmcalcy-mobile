import React, { forwardRef, memo, useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AUTH_COLORS, AUTH_FONT, AUTH_SPACING, AUTH_TYPE } from './authTokens';

export interface AuthInputProps extends TextInputProps {
  /** Leading MaterialCommunityIcons glyph name. */
  leftIcon: string;
  /** Trailing MaterialCommunityIcons glyph name (e.g. password reveal). */
  rightIcon?: string;
  onRightIconPress?: () => void;
  /** Inline validation message rendered below the field. */
  errorMessage?: string;
}

/**
 * Rounded, placeholder-style auth text field.
 *
 *  - Height 58, radius 14, 16px horizontal padding
 *  - Border #E8E8E8 (→ primary green on focus, → red on error)
 *  - Leading icon, optional trailing (toggle) icon
 *  - Very subtle shadow
 */
const AuthInput = forwardRef<TextInput, AuthInputProps>(
  (
    {
      leftIcon,
      rightIcon,
      onRightIconPress,
      errorMessage,
      onFocus,
      onBlur,
      accessibilityLabel,
      placeholder,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(errorMessage);

    const handleFocus = useCallback<NonNullable<TextInputProps['onFocus']>>(
      e => {
        setIsFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback<NonNullable<TextInputProps['onBlur']>>(
      e => {
        setIsFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const borderColor = hasError
      ? AUTH_COLORS.error
      : isFocused
      ? AUTH_COLORS.inputBorderFocus
      : AUTH_COLORS.inputBorder;

    const iconColor = isFocused ? AUTH_COLORS.primary : AUTH_COLORS.placeholder;

    return (
      <View>
        <View style={[styles.field, { borderColor }]}>
          <Icon name={leftIcon} size={22} color={iconColor} style={styles.leftIcon} />

          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={AUTH_COLORS.placeholder}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={accessibilityLabel ?? placeholder}
            {...rest}
          />

          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              style={styles.rightIcon}
            >
              <Icon name={rightIcon} size={22} color={AUTH_COLORS.placeholder} />
            </TouchableOpacity>
          )}
        </View>

        {hasError && <Text style={styles.error}>{errorMessage}</Text>}
      </View>
    );
  },
);

AuthInput.displayName = 'AuthInput';

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: AUTH_SPACING.inputHeight,
    borderWidth: 1,
    borderRadius: AUTH_SPACING.inputRadius,
    paddingHorizontal: AUTH_SPACING.inputPaddingHorizontal,
    backgroundColor: AUTH_COLORS.surface,
    // Very subtle shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: AUTH_TYPE.input,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textPrimary,
  },
  rightIcon: {
    marginLeft: 12,
  },
  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.error,
  },
});

export default memo(AuthInput);
