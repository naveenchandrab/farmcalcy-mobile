import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';

const STORYBOOK = process.env.STORYBOOK === 'true';

const RootComponent = STORYBOOK
  ? require('./.storybook').default
  : require('./App').default;

AppRegistry.registerComponent(appName, () => RootComponent);
