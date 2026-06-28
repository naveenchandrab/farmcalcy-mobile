/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Global Jest setup — runs once before every test file.
 *
 * It mocks every native module the authentication flow touches so screens,
 * hooks and services can run in the pure-JS jest environment without a device:
 *
 *   - react-native-config      → static env (env.ts throws without BASE_URL)
 *   - react-native-keychain    → in-memory secure store
 *   - AsyncStorage             → official in-memory mock
 *   - react-native-reanimated  → lightweight animation stubs
 *   - vector-icons             → render the glyph name as text
 *   - safe-area-context        → zero insets + pass-through providers
 *   - gesture-handler          → official jest setup
 *   - @utils/toast             → jest.fn()s so tests can assert on toasts
 *
 * Individual test files may still override any of these with jest.mock().
 */

import '@testing-library/jest-native/extend-expect';

// ─── react-native-config ────────────────────────────────────────────────────
// Mirrors .env.development so `@config/env` resolves without throwing.
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    BASE_URL: 'http://localhost:3000/api/v1',
    APP_ENV: 'development',
  },
}));

// ─── react-native-keychain (in-memory secure store) ─────────────────────────
jest.mock('react-native-keychain', () => {
  let store = null; // { username, password } | null

  return {
    ACCESSIBLE: {
      AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
      WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    },
    setGenericPassword: jest.fn(async (username, password) => {
      store = { username, password, service: 'mock' };
      return true;
    }),
    getGenericPassword: jest.fn(async () => (store ? { ...store } : false)),
    resetGenericPassword: jest.fn(async () => {
      store = null;
      return true;
    }),
    // Test helper — reset the in-memory store between tests.
    __reset: () => {
      store = null;
    },
  };
});

// ─── AsyncStorage ───────────────────────────────────────────────────────────
jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// ─── react-native-reanimated ────────────────────────────────────────────────
// The official mock doesn't cover the layout-animation builders (FadeInDown,
// ZoomIn, …) used across the auth screens, so we provide a focused stub.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text } = require('react-native');

  // A chainable layout-animation builder: FadeInDown.delay(x).duration(y).
  const makeAnimationBuilder = () => {
    const builder = {
      delay: () => builder,
      duration: () => builder,
      springify: () => builder,
      build: () => ({}),
    };
    return builder;
  };

  const AnimatedView = React.forwardRef((props, ref) =>
    React.createElement(View, { ...props, ref }, props.children),
  );
  AnimatedView.displayName = 'Animated.View';

  const AnimatedText = React.forwardRef((props, ref) =>
    React.createElement(Text, { ...props, ref }, props.children),
  );
  AnimatedText.displayName = 'Animated.Text';

  const createAnimatedComponent = Component => {
    const Wrapped = React.forwardRef((props, ref) =>
      React.createElement(Component, { ...props, ref }, props.children),
    );
    Wrapped.displayName = 'Animated.Component';
    return Wrapped;
  };

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      Text: AnimatedText,
      createAnimatedComponent,
    },
    View: AnimatedView,
    Text: AnimatedText,
    createAnimatedComponent,
    useSharedValue: initial => ({ value: initial }),
    useAnimatedStyle: factory => (typeof factory === 'function' ? factory() : {}),
    withTiming: toValue => toValue,
    withSpring: toValue => toValue,
    withDelay: (_d, value) => value,
    Easing: { bezier: () => () => 0, linear: () => 0, out: fn => fn, ease: () => 0 },
    FadeIn: makeAnimationBuilder(),
    FadeInDown: makeAnimationBuilder(),
    FadeInUp: makeAnimationBuilder(),
    FadeOut: makeAnimationBuilder(),
    ZoomIn: makeAnimationBuilder(),
  };
});

// ─── react-native-vector-icons ──────────────────────────────────────────────
// Render the glyph name as text so icons remain queryable in tests.
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Icon = ({ name, ...rest }) =>
    React.createElement(Text, { ...rest, accessibilityRole: 'image' }, name);
  Icon.displayName = 'MockMaterialCommunityIcon';
  return { __esModule: true, default: Icon };
});

// ─── react-native-safe-area-context ─────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children, ...rest }) => React.createElement(View, rest, children),
    SafeAreaInsetsContext: {
      Consumer: ({ children }) => children(inset),
      Provider: ({ children }) => children,
    },
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
    initialWindowMetrics: { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: inset },
  };
});

// ─── react-native-gesture-handler ───────────────────────────────────────────
require('react-native-gesture-handler/jestSetup');

// ─── Toasts ─────────────────────────────────────────────────────────────────
// Hooks/screens call these for user feedback; mock so tests can assert without
// pulling in the design-system Toast portal.
jest.mock('@utils/toast', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
  showInfo: jest.fn(),
  showWarning: jest.fn(),
  hideToast: jest.fn(),
}));

// Silence the dev-only request/response logging in the axios interceptors so
// test output stays readable. Tests that assert on console can spy locally.
const originalWarn = console.warn;
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((...args) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    if (first.startsWith('[API')) {
      return; // swallow API trace logs
    }
    originalWarn(...args);
  });
});

afterEach(() => {
  // Keep the in-memory Keychain isolated between tests.
  const keychain = require('react-native-keychain');
  if (typeof keychain.__reset === 'function') {
    keychain.__reset();
  }
});
