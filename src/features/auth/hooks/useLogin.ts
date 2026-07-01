import { useMutation } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { useAuthStore } from '@store/authStore';
import { showError } from '@utils/toast';

import { authService } from '../services/auth.service';
import { mapAuthUserToUser } from '../types';
import type { LoginApiResponse, LoginFormValues } from '../types';

/** Friendly, non-revealing copy for the statuses the login endpoint can return. */
const LOGIN_ERROR_OVERRIDES: Partial<Record<number, string>> = {
  400: 'Please enter a valid email/mobile number and password.',
  401: 'The credentials you entered are incorrect.',
  403: 'Your account does not have access. Please contact your administrator.',
  429: 'Too many login attempts. Please wait a moment and try again.',
};

/**
 * Login mutation.
 *
 * On success:
 *  - normal user        → persists tokens + user and grants access; the
 *    RootNavigator's conditional stack swaps to the app automatically.
 *  - mustChangePassword → persists the session WITHOUT granting access; the
 *    caller navigates to the forced password-change screen.
 *
 * On error → a mapped, user-safe toast (backend messages are never surfaced raw).
 * The caller can branch on `data.user.mustChangePassword` in its own onSuccess.
 */
export const useLogin = () => {
  const login = useAuthStore(state => state.login);
  const beginForcedPasswordChange = useAuthStore(state => state.beginForcedPasswordChange);

  return useMutation<LoginApiResponse, unknown, LoginFormValues>({
    mutationFn: async (values: LoginFormValues) =>
      authService.login({
        identifier: values.identifier.trim(),
        password: values.password,
      }),
    onSuccess: async response => {
      const user = mapAuthUserToUser(response.user);
      const tokens = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };

      if (response.user.mustChangePassword) {
        await beginForcedPasswordChange(user, tokens);
      } else {
        await login(user, tokens);
      }
    },
    onError: (error: unknown) => {
      showError(extractErrorMessage(error, LOGIN_ERROR_OVERRIDES));
    },
  });
};
