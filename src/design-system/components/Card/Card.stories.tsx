import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import Card from './Card';
import Typography from '../Typography/Typography';

const meta: Meta<typeof Card> = {
  title: 'Design System/Card',
  component: Card,
  args: {
    elevation: 'sm',
    padding: 'md',
  },
  argTypes: {
    elevation: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
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
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <Typography preset="headingSm">Batch #7</Typography>
      <Typography preset="bodyMd" color="#666">Broiler — 5,000 birds placed</Typography>
      <Typography preset="bodySm" color="#888" style={{ marginTop: 4 }}>Started: 10 Jun 2026</Typography>
    </Card>
  ),
};

export const NoElevation: Story = {
  render: () => (
    <Card elevation="none" padding="md">
      <Typography preset="bodyMd">Flat card with no shadow</Typography>
    </Card>
  ),
};

export const LargePadding: Story = {
  render: () => (
    <Card elevation="sm" padding="lg">
      <Typography preset="headingSm">Financial Summary</Typography>
      <Typography preset="bodyMd" style={{ marginTop: 8 }}>Total Earnings: ₹2,40,000</Typography>
      <Typography preset="bodyMd">Advance Paid: ₹60,000</Typography>
      <Typography preset="bodyMd">Balance Due: ₹1,80,000</Typography>
    </Card>
  ),
};

export const NoPadding: Story = {
  render: () => (
    <Card elevation="xs" padding="none">
      <View style={{ padding: 16, backgroundColor: '#E8F5E9', borderRadius: 12 }}>
        <Typography preset="labelMd" color="#1B3D1B">Custom inner layout</Typography>
      </View>
    </Card>
  ),
};
