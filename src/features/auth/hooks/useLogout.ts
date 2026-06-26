import { useMutation } from '@tanstack/react-query';

import { TokenService } from '@services/TokenService';
import { useAuthStore } from '@store/authStore';
import { queryClient } from '@services/queryClient';

import { authService } from '../services/auth.service';

/**
 * Wraps the logout API call in a TanStack Query mutation.
 *
 * Strategy: always clear local state regardless of API success.
 * If the network call fails (e.g. offline), the user is still logged
 * out locally. The refresh token may remain valid server-side until
 * it expires naturally, which is an acceptable security trade-off
 * for a mobile farming app operating in low-connectivity zones.
 */
export const useLogout = () => {
  const logout = useAuthStore(state => state.logout);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await TokenService.getRefreshToken();
      if (refreshToken) {
        await authService.logout({ refreshToken });
      }
    },
    onSettled: async () => {
      // Clear ALL cached query data so stale data from the previous
      // user's session never leaks into the next session.
      queryClient.clear();
      await logout();
    },
  });
};
