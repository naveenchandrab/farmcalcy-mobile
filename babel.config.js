module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.ts',
          '.tsx',
          '.json',
          '.native.js',
        ],
        alias: {
          '@assets': './src/assets',
          '@components': './src/components',
          '@constants': './src/constants',
          '@features': './src/features',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@services': './src/services',
          '@store': './src/store',
          '@theme': './src/theme',
          '@app-types': './src/types',
          '@utils': './src/utils',
          '@config': './src/config',
          '@api': './src/api',
          '@design-system': './src/design-system',
        },
      },
    ],
    'react-native-reanimated/plugin',
    ['transform-inline-environment-variables', { include: ['STORYBOOK'] }],
  ],
};
