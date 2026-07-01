import React, { useCallback, useState } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';

import AuthInput from '@features/auth/components/AuthInput';
import { AUTH_COLORS, AUTH_FONT } from '@features/auth/components/authTokens';

import { useValidateCompanyCode } from '../hooks/useRegistrationMutations';

interface CompanyCodeFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  error?: string;
}

/**
 * Company-code input with live validation against the public
 * /registrations/validate-company-code endpoint. Shows the resolved company name
 * (green) when valid, or an inline message when the code is not recognised. The
 * backend re-validates on submit, so this is a UX aid rather than a hard gate.
 */
function CompanyCodeField<T extends FieldValues>({
  control,
  name,
  error,
}: CompanyCodeFieldProps<T>): React.ReactElement {
  const { mutate: validate, isPending } = useValidateCompanyCode();
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const runValidation = useCallback(
    (raw: string) => {
      const code = raw.trim().toUpperCase();
      if (code.length < 3) {
        setChecked(false);
        setResolvedName(null);
        return;
      }
      validate(code, {
        onSuccess: result => {
          setChecked(true);
          setResolvedName(result.valid ? result.companyName : null);
        },
      });
    },
    [validate],
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => {
        const stringValue = typeof value === 'string' ? value : '';
        return (
          <>
            <AuthInput
              testID="registration-field-companyCode"
              leftIcon="qrcode"
              placeholder="Company Code (e.g. FCC-7A91KD)"
              value={stringValue}
              onChangeText={(text: string) => {
                onChange(text);
                setChecked(false);
                setResolvedName(null);
              }}
              onBlur={() => {
                onBlur();
                runValidation(stringValue);
              }}
              errorMessage={error}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {!error && isPending ? <Text style={styles.checking}>Checking code…</Text> : null}
            {!error && !isPending && checked && resolvedName ? (
              <Text style={styles.valid}>✓ {resolvedName}</Text>
            ) : null}
            {!error && !isPending && checked && !resolvedName ? (
              <Text style={styles.invalid}>
                Company code not found. Please check with your administrator.
              </Text>
            ) : null}
          </>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  checking: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.textSecondary,
  },
  valid: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: AUTH_FONT.medium,
    color: AUTH_COLORS.primary,
  },
  invalid: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    fontFamily: AUTH_FONT.regular,
    color: AUTH_COLORS.error,
  },
});

export default CompanyCodeField;
