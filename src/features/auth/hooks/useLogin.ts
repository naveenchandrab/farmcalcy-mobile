import { useMutation } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { useAuthStore } from '@store/authStore';
import { showError } from '@utils/toast';

import { authService } from '../services/auth.service';
import type { LoginFormValues } from '../types';

/**
 * Wraps the login API call in a TanStack Query mutation.
 *
 * On success → persists tokens + user to Keychain / AsyncStorage via AuthStore.
 *             The RootNavigator's conditional stack switch handles navigation
 *             automatically — no explicit navigate() call needed here.
 *
 * On error   → shows a toast with the mapped error message.
 *              The caller can still read `error` from the mutation result
 *              for field-level inline errors if needed.
 */
export const useLogin = () => {
  const login = useAuthStore(state => state.login);

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await authService.login({
        email: values.identifier,
        password: values.password,
      });
      return response.data;
    },
    onSuccess: async loginData => {
      await login(loginData.user, {
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
      });
    },
    onError: (error: unknown) => {
      showError(extractErrorMessage(error));
    },
  });
};
