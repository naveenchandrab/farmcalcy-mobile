import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError, showSuccess } from '@utils/toast';

import { registrationService } from '../services/registration.service';
import type {
  PaginatedRegistrations,
  RegistrationResponse,
  RegistrationStatus,
  RegistrationType,
} from '../types';

export interface RegistrationListFilters {
  status?: RegistrationStatus;
  requestType?: RegistrationType;
  search?: string;
  page?: number;
}

export const registrationKeys = {
  all: ['registrations'] as const,
  list: (filters: RegistrationListFilters) => ['registrations', 'list', filters] as const,
  detail: (id: string) => ['registrations', 'detail', id] as const,
};

/** Reviewer-scoped, paginated registration list. */
export const useRegistrationList = (
  filters: RegistrationListFilters,
): UseQueryResult<PaginatedRegistrations, Error> =>
  useQuery<PaginatedRegistrations, Error>({
    queryKey: registrationKeys.list(filters),
    queryFn: () =>
      registrationService.list({
        status: filters.status,
        requestType: filters.requestType,
        search: filters.search || undefined,
        page: filters.page,
      }),
  });

export const useRegistration = (id: string): UseQueryResult<RegistrationResponse, Error> =>
  useQuery<RegistrationResponse, Error>({
    queryKey: registrationKeys.detail(id),
    queryFn: () => registrationService.getById(id),
    enabled: Boolean(id),
  });

export const useApproveRegistration = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<RegistrationResponse, unknown, void>({
    mutationFn: () => registrationService.approve(id),
    onSuccess: async updated => {
      queryClient.setQueryData(registrationKeys.detail(id), updated);
      await queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      showSuccess('Registration approved. Credentials have been sent to the applicant.');
    },
    onError: error => showError(extractErrorMessage(error)),
  });
};

export const useRejectRegistration = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation<RegistrationResponse, unknown, string | undefined>({
    mutationFn: (reason?: string) => registrationService.reject(id, reason),
    onSuccess: async updated => {
      queryClient.setQueryData(registrationKeys.detail(id), updated);
      await queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      showSuccess('Registration rejected. The applicant has been notified.');
    },
    onError: error => showError(extractErrorMessage(error)),
  });
};
