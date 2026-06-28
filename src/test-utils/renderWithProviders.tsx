/**
 * `renderWithProviders` — the single entry point for rendering any auth screen
 * or hook under test with the real app context stack.
 *
 * It wires up:
 *   - a FRESH React Query client per render (retries off, no caching) so tests
 *     are deterministic and isolated from one another
 *   - the SafeAreaProvider (mocked to zero insets in jest.setup)
 *
 * Navigation is injected per-screen via `makeScreenProps` (see mockNavigation),
 * so it is intentionally not part of the provider tree here.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, type RenderOptions } from '@testing-library/react-native';
import React, { type PropsWithChildren, type ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

/** A query client tuned for tests: no retries, no background refetching. */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

interface ProvidersProps extends PropsWithChildren {
  queryClient?: QueryClient;
}

export const AllProviders: React.FC<ProvidersProps> = ({ children, queryClient }) => {
  const client = queryClient ?? createTestQueryClient();
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  );
};

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

/** Drop-in replacement for RTL `render` that mounts the provider stack. */
export const renderWithProviders = (
  ui: ReactElement,
  { queryClient, ...options }: ExtendedRenderOptions = {},
) => {
  const client = queryClient ?? createTestQueryClient();
  const result = render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={client}>{children}</AllProviders>
    ),
    ...options,
  });
  return { ...result, queryClient: client };
};

/** Hook variant — for testing React Query hooks (useLogin, useResendOtp, …). */
export const renderHookWithProviders = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  { queryClient, ...options }: ExtendedRenderOptions = {},
) => {
  const client = queryClient ?? createTestQueryClient();
  const result = renderHook(callback, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={client}>{children}</AllProviders>
    ),
    ...options,
  });
  return { ...result, queryClient: client };
};
