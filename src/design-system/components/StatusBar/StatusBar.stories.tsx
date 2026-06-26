import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import AppStatusBar from './StatusBar';
import Typography from '../Typography/Typography';

const meta: Meta<typeof AppStatusBar> = {
  title: 'Design System/AppStatusBar',
  component: AppStatusBar,
  args: {
    translucent: false,
  },
  argTypes: {
    translucent: { control: 'boolean' },
    backgroundColor: { control: 'text' },
    style: {
      control: 'select',
      options: ['light-content', 'dark-content'],
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppStatusBar>;

export const Default: Story = {
  render: (args) => (
    <View>
      <AppStatusBar {...args} />
      <Typography preset="bodySm" color="#888">
        AppStatusBar mounts imperatively — check the device status bar above.
      </Typography>
    </View>
  ),
};

export const LightContent: Story = {
  render: () => (
    <View style={{ backgroundColor: '#1B3D1B', padding: 12, borderRadius: 8 }}>
      <AppStatusBar style="light-content" backgroundColor="#1B3D1B" />
      <Typography preset="bodySm" color="#FFFFFF">Light content on dark background</Typography>
    </View>
  ),
};

export const DarkContent: Story = {
  render: () => (
    <View style={{ backgroundColor: '#F7F9F7', padding: 12, borderRadius: 8 }}>
      <AppStatusBar style="dark-content" backgroundColor="#F7F9F7" />
      <Typography preset="bodySm" color="#1B3D1B">Dark content on light background</Typography>
    </View>
  ),
};
