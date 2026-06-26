const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const STORYBOOK = process.env.STORYBOOK === 'true';

/**
 * Metro config with path alias resolution.
 * babel-plugin-module-resolver handles compile-time alias resolution;
 * extraNodeModules covers edge cases during Metro's module graph traversal.
 */
const config = {
  resolver: {
    extraNodeModules: {
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@navigation': path.resolve(__dirname, 'src/navigation'),
      '@screens': path.resolve(__dirname, 'src/screens'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@theme': path.resolve(__dirname, 'src/theme'),
      '@app-types': path.resolve(__dirname, 'src/types'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@design-system': path.resolve(__dirname, 'src/design-system'),
    },
  },
  watchFolders: [path.resolve(__dirname, 'src')],
};

const baseConfig = mergeConfig(getDefaultConfig(__dirname), config);

// Always run withStorybook so it can stub out @storybook/* in non-storybook builds.
// enabled: false + onDisabledRemoveStorybook: true replaces all @storybook/* with
// empty modules, preventing resolution errors when Metro sees the require('./.storybook')
// dead-code branch.
const withStorybook = require('@storybook/react-native/metro/withStorybook');
module.exports = withStorybook(baseConfig, {
  enabled: STORYBOOK,
  configPath: path.resolve(__dirname, '.storybook'),
  onDisabledRemoveStorybook: true,
});
