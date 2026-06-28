import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import LoadingSpinner from './LoadingSpinner';

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Design System/LoadingSpinner',
  component: LoadingSpinner,
  args: {
    overlay: false,
    size: 'large',
  },
  argTypes: {
    overlay: { control: 'boolean' },
    size: {
      control: 'select',
      options: ['small', 'large'],
    },
    message: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 32, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoadingSpinner>;

export const Inline: Story = { args: { overlay: false } };

export const InlineWithMessage: Story = {
  args: { overlay: false, message: 'Loading batches…' },
};

export const Small: Story = {
  args: { overlay: false, size: 'small' },
};

export const Overlay: Story = {
  render: () => (
    <View style={{ height: 200, backgroundColor: '#F7F9F7', borderRadius: 12, overflow: 'hidden' }}>
      <View style={{ padding: 16 }}>
        <LoadingSpinner overlay message="Saving…" />
      </View>
    </View>
  ),
};
