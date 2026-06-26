import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { withBackgrounds } from '@storybook/addon-ondevice-backgrounds';
import type { Preview } from '@storybook/react-native';
import { ThemeProvider } from '../src/design-system/theme';
import { ToastProvider } from '../src/design-system/components/Toast/Toast';
import { ToastBridge } from '../src/design-system/components/Toast/Toast';

const preview: Preview = {
  decorators: [
    (Story) => (
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <ToastBridge />
            <Story />
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    ),
    withBackgrounds,
  ],
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F7F9F7' },
        { name: 'dark', value: '#121212' },
        { name: 'white', value: '#FFFFFF' },
      ],
    },
  },
};

export default preview;
