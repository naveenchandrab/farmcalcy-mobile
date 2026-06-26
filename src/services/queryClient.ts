import { QueryClient } from '@tanstack/react-query';

import { extractErrorMessage } from '@services/ApiErrorMapper';
import { showError } from '@utils/toast';

/**
 * Global QueryClient with production-grade defaults.
 *
 * - retry: 1 → retries once before surfacing an error (network hiccups)
 * - staleTime: 5 min → data stays fresh; avoids needless background fetches
 * - gcTime: 10 min → inactive cache entries live for 10 min (formerly cacheTime)
 * - networkMode: 'online' → mutations/queries pause when offline rather than failing
 * - onError: shows a toast for any unhandled query error
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30_000),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      networkMode: 'online',
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
      onError: (error: unknown) => {
        const message = extractErrorMessage(error);
        showError(message);
      },
    },
  },
});
