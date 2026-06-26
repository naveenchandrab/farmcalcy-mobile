import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import AppSafeAreaView from './SafeAreaView';
import Typography from '../Typography/Typography';
import Divider from '../Divider/Divider';

const meta: Meta<typeof AppSafeAreaView> = {
  title: 'Design System/AppSafeAreaView',
  component: AppSafeAreaView,
  argTypes: {
    edges: {
      control: 'multi-select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, minHeight: 200 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppSafeAreaView>;

export const Default: Story = {
  render: (args) => (
    <AppSafeAreaView {...args} edges={['top', 'left', 'right']}>
      <View style={{ padding: 16 }}>
        <Typography preset="headingSm">Screen with Safe Area</Typography>
        <Divider marginV={8} />
        <Typography preset="bodyMd" color="#666">
          Content respects the top safe area (notch / Dynamic Island).
        </Typography>
      </View>
    </AppSafeAreaView>
  ),
};

export const TopOnly: Story = {
  render: (args) => (
    <AppSafeAreaView {...args} edges={['top']}>
      <View style={{ padding: 16, backgroundColor: '#1B3D1B' }}>
        <Typography preset="headingSm" color="#FFFFFF">Header Area</Typography>
      </View>
      <View style={{ padding: 16 }}>
        <Typography preset="bodyMd">Screen body content</Typography>
      </View>
    </AppSafeAreaView>
  ),
};

export const AllEdges: Story = {
  render: (args) => (
    <AppSafeAreaView {...args} edges={['top', 'bottom', 'left', 'right']}>
      <View style={{ padding: 16, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Typography preset="bodySm" color="#888">All edges protected</Typography>
      </View>
    </AppSafeAreaView>
  ),
};
