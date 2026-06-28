import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Typography from '../Typography/Typography';

import Divider from './Divider';


const meta: Meta<typeof Divider> = {
  title: 'Design System/Divider',
  component: Divider,
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    thickness: { control: 'number' },
    marginV: { control: 'number' },
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
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  render: () => (
    <View style={{ gap: 0 }}>
      <Typography preset="bodyMd">Above the divider</Typography>
      <Divider marginV={12} />
      <Typography preset="bodyMd">Below the divider</Typography>
    </View>
  ),
};

export const Vertical: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', height: 40, alignItems: 'center', gap: 12 }}>
      <Typography preset="bodyMd">Left</Typography>
      <Divider orientation="vertical" />
      <Typography preset="bodyMd">Right</Typography>
    </View>
  ),
};

export const Thick: Story = {
  render: () => (
    <View>
      <Divider thickness={2} marginV={8} />
    </View>
  ),
};

export const CustomColor: Story = {
  render: () => (
    <View>
      <Divider color="#E67E22" marginV={8} />
    </View>
  ),
};
