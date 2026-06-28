import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { ApiResponse, PaginatedResponse, User, UserStatus } from '@app-types';
import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError, showSuccess } from '@utils/toast';

import { usersService } from '../services/users.service';
import type { CreateUserFormValues, EditUserFormValues, UserListFilters } from '../types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const userKeys = {
  all: ['users'] as const,
  list: (filters: Partial<UserListFilters>) => ['users', 'list', filters] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
};

// ─── List ─────────────────────────────────────────────────────────────────────

/** Paginated, filtered user list. Refetches when filters change. */
export const useUserList = (
  filters: Partial<UserListFilters>,
): UseQueryResult<PaginatedResponse<User>, Error> =>
  useQuery<ApiResponse<PaginatedResponse<User>>, Error, PaginatedResponse<User>>({
    queryKey: userKeys.list(filters),
    queryFn: () => usersService.getUsers(filters),
    select: response => response.data,
  });

// ─── Single ───────────────────────────────────────────────────────────────────

/** Single user by ID. Enabled only when userId is truthy. */
export const useUser = (userId: string): UseQueryResult<User, Error> =>
  useQuery<ApiResponse<User>, Error, User>({
    queryKey: userKeys.detail(userId),
    queryFn: () => usersService.getUserById(userId),
    enabled: Boolean(userId),
    select: response => response.data,
  });

// ─── Create ───────────────────────────────────────────────────────────────────

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateUserFormValues) =>
      usersService.createUser({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        role: values.role,
        password: values.password,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccess('User created successfully.');
    },
    onError: (error: unknown) => {
      showError(extractErrorMessage(error));
    },
  });
};

// ─── Edit ─────────────────────────────────────────────────────────────────────

export const useUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EditUserFormValues) =>
      usersService.updateUser(userId, {
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        role: values.role,
        password: values.password || undefined,
      }),
    onSuccess: async updatedResponse => {
      // Update cached detail immediately
      queryClient.setQueryData(userKeys.detail(userId), updatedResponse);
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
      showSuccess('User updated successfully.');
    },
    onError: (error: unknown) => {
      showError(extractErrorMessage(error));
    },
  });
};

// ─── Status Toggle (optimistic) ───────────────────────────────────────────────

/**
 * Toggles a user's ACTIVE / INACTIVE status with an optimistic update.
 * If the API call fails the previous status is rolled back automatically.
 */
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: UserStatus }) =>
      usersService.toggleStatus(userId, { status }),

    onMutate: async ({ userId, status }) => {
      // Cancel any in-flight refetches that would overwrite the optimistic update
      await queryClient.cancelQueries({ queryKey: userKeys.detail(userId) });

      const previousUser = queryClient.getQueryData<{ data: User }>(userKeys.detail(userId));

      // Apply the optimistic update
      queryClient.setQueryData(userKeys.detail(userId), (old: { data: User } | undefined) => {
        if (!old) {
          return old;
        }
        return { ...old, data: { ...old.data, status } };
      });

      return { previousUser };
    },

    onError: (_error, { userId }, context) => {
      // Roll back to the previous value
      if (context?.previousUser) {
        queryClient.setQueryData(userKeys.detail(userId), context.previousUser);
      }
      showError('Failed to update user status. Please try again.');
    },

    onSettled: async (_data, _error, { userId }) => {
      await queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      await queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
