// Must be the very first import — required by @react-navigation/drawer and
// other gesture-driven navigators (initialises react-native-gesture-handler).
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';

// The Storybook entry is swapped in at bundle time via a Babel inline-env
// transform (STORYBOOK). Both targets load through untyped `require()` so the
// non-selected one is never evaluated; the values are necessarily `any`, so the
// unsafe-* rules are disabled for this RN entry file only.
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
const STORYBOOK = process.env.STORYBOOK === 'true';

const RootComponent = STORYBOOK
  ? require('./.storybook').default
  : require('./App').default;

AppRegistry.registerComponent(appName, () => RootComponent);
