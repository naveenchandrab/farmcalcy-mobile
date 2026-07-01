import { useMutation } from '@tanstack/react-query';

import type {
  RegisterTenantFormValues,
  RegisterStaffFormValues,
  RegisterFarmOwnerFormValues,
} from '@features/auth/types';
import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError } from '@utils/toast';

import { registrationService } from '../services/registration.service';
import { toTenantRequest, toStaffRequest, toFarmOwnerRequest } from '../types';
import type {
  CompanyCodeValidation,
  RegistrationResponse,
  RegistrationStatusResponse,
} from '../types';

/** Friendly copy for the statuses the public registration endpoints can return. */
const REGISTER_ERROR_OVERRIDES: Partial<Record<number, string>> = {
  409: 'A registration already exists for these details. Please check your email/phone.',
  429: 'Too many attempts. Please wait a moment and try again.',
};

export const useRegisterTenant = () =>
  useMutation<RegistrationResponse, unknown, RegisterTenantFormValues>({
    mutationFn: values => registrationService.registerTenant(toTenantRequest(values)),
    onError: error => showError(extractErrorMessage(error, REGISTER_ERROR_OVERRIDES)),
  });

export const useRegisterSupervisor = () =>
  useMutation<RegistrationResponse, unknown, RegisterStaffFormValues>({
    mutationFn: values => registrationService.registerSupervisor(toStaffRequest(values)),
    onError: error => showError(extractErrorMessage(error, REGISTER_ERROR_OVERRIDES)),
  });

export const useRegisterFarmOwner = () =>
  useMutation<RegistrationResponse, unknown, RegisterFarmOwnerFormValues>({
    mutationFn: values => registrationService.registerFarmOwner(toFarmOwnerRequest(values)),
    onError: error => showError(extractErrorMessage(error, REGISTER_ERROR_OVERRIDES)),
  });

/**
 * Validates a company code on demand (used by the supervisor / farm-owner forms).
 * Errors are swallowed to a `{ valid:false }` result so the form can show inline
 * feedback rather than a toast.
 */
export const useValidateCompanyCode = () =>
  useMutation<CompanyCodeValidation, unknown, string>({
    mutationFn: async (code: string) => {
      try {
        return await registrationService.validateCompanyCode(code);
      } catch {
        return { valid: false, companyName: null, companyCode: null };
      }
    },
  });

/**
 * Tracks a registration by email or phone. A 404 (no match) is surfaced via the
 * mutation's error state so the screen can show a friendly "not found" message
 * rather than a toast.
 */
export const useTrackRegistration = () =>
  useMutation<RegistrationStatusResponse, unknown, string>({
    mutationFn: (identifier: string) => registrationService.track(identifier),
  });
