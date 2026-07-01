import React from 'react';
import type { Control, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { View } from 'react-native';

import { INDIAN_STATES } from '@constants/indianStates';

import RegistrationSelectField from './RegistrationSelectField';
import RegistrationTextField from './RegistrationTextField';

/** The structured-address subset every registration form shares. */
export interface AddressFieldValues {
  addressLine1: string;
  addressLine2?: string;
  taluk?: string;
  village?: string;
  landmark?: string;
  district: string;
  state: string;
  pincode: string;
}

interface AddressFieldsProps<T extends FieldValues> {
  control: Control<T>;
  errors: FieldErrors<T>;
}

/**
 * Renders the shared structured-address block: Address Line 1/2, Taluk, Village,
 * Landmark, District, State (picker) and PIN code. Reused by the company,
 * supervisor and farm-owner registration forms.
 */
function AddressFields<T extends FieldValues>({
  control,
  errors,
}: AddressFieldsProps<T>): React.ReactElement {
  // T is always a superset of AddressFieldValues at every call site; narrow the
  // errors accessor to that subset so per-field messages type-check.
  const err = errors as FieldErrors<AddressFieldValues>;
  const field = (name: keyof AddressFieldValues): Path<T> => name as Path<T>;

  return (
    <View style={{ gap: 16 }}>
      <RegistrationTextField
        control={control}
        name={field('addressLine1')}
        leftIcon="home-outline"
        placeholder="Address Line 1"
        error={err.addressLine1?.message}
      />
      <RegistrationTextField
        control={control}
        name={field('addressLine2')}
        leftIcon="home-outline"
        placeholder="Address Line 2 (optional)"
        error={err.addressLine2?.message}
      />
      <RegistrationTextField
        control={control}
        name={field('village')}
        leftIcon="home-group"
        placeholder="Village (optional)"
        error={err.village?.message}
      />
      <RegistrationTextField
        control={control}
        name={field('taluk')}
        leftIcon="map-outline"
        placeholder="Taluk (optional)"
        error={err.taluk?.message}
      />
      <RegistrationTextField
        control={control}
        name={field('landmark')}
        leftIcon="map-marker-radius-outline"
        placeholder="Landmark (optional)"
        error={err.landmark?.message}
      />
      <RegistrationTextField
        control={control}
        name={field('district')}
        leftIcon="map-marker-outline"
        placeholder="District"
        error={err.district?.message}
      />
      <RegistrationSelectField
        control={control}
        name={field('state')}
        leftIcon="map-marker-outline"
        placeholder="State"
        options={INDIAN_STATES}
        error={err.state?.message}
      />
      <RegistrationTextField
        control={control}
        name={field('pincode')}
        leftIcon="numeric"
        placeholder="PIN Code"
        keyboardType="number-pad"
        error={err.pincode?.message}
      />
    </View>
  );
}

export default AddressFields;
