/**
 * Barrel for the auth test toolkit. Import everything from one place:
 *
 *   import {
 *     renderWithProviders, makeScreenProps, makeLoginResponse,
 *     httpError, TEST_IDS,
 *   } from '@test-utils';
 */
export * from './renderWithProviders';
export * from './mockNavigation';
export * from './factories';
export * from './apiMocks';
export * from './testIDs';

// Re-export RTL so test files have a single import source.
export {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react-native';
