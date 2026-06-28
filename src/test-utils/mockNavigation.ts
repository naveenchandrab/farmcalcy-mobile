/**
 * Lightweight React Navigation stand-ins for screen unit tests.
 *
 * Screens receive `navigation` + `route` as props (NativeStackScreenProps), so
 * rather than mounting a real NavigationContainer (slow, flaky, hard to assert
 * on) we inject jest-mocked props and assert on `navigation.navigate` calls.
 */
import type { AuthStackParamList, AuthScreenProps } from '@navigation/types';

export interface MockNavigation {
  navigate: jest.Mock;
  goBack: jest.Mock;
  reset: jest.Mock;
  setOptions: jest.Mock;
  setParams: jest.Mock;
  addListener: jest.Mock;
  dispatch: jest.Mock;
  canGoBack: jest.Mock;
}

/** A fresh set of jest.fn() navigation handlers. */
export const mockNavigation = (): MockNavigation => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => jest.fn()), // returns an unsubscribe fn
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
});

/**
 * Builds typed `{ navigation, route }` props for a given auth screen.
 *
 *   const { navigation, props } = makeScreenProps('OtpVerification', { email });
 *   render(<OtpVerificationScreen {...props} />);
 */
export const makeScreenProps = <T extends keyof AuthStackParamList>(
  name: T,
  params: AuthStackParamList[T],
): { navigation: MockNavigation; props: AuthScreenProps<T> } => {
  const navigation = mockNavigation();
  const route = {
    key: `${name}-key`,
    name,
    params,
  } as unknown as AuthScreenProps<T>['route'];

  return {
    navigation,
    props: {
      navigation: navigation as unknown as AuthScreenProps<T>['navigation'],
      route,
    },
  };
};
