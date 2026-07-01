import React from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import type { KeyboardTypeOptions, TextInputProps } from 'react-native';

import AuthInput from '@features/auth/components/AuthInput';

interface RegistrationTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  placeholder: string;
  leftIcon: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  multiline?: boolean;
}

/**
 * Thin Controller + AuthInput wrapper so the (long) registration forms stay
 * declarative and visually identical to the rest of the auth flow.
 */
function RegistrationTextField<T extends FieldValues>({
  control,
  name,
  placeholder,
  leftIcon,
  error,
  keyboardType,
  autoCapitalize = 'sentences',
  multiline,
}: RegistrationTextFieldProps<T>): React.ReactElement {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <AuthInput
          testID={`registration-field-${name}`}
          leftIcon={leftIcon}
          placeholder={placeholder}
          value={typeof value === 'string' ? value : ''}
          onChangeText={onChange}
          onBlur={onBlur}
          errorMessage={error}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          multiline={multiline}
        />
      )}
    />
  );
}

export default RegistrationTextField;
