import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Design System/Badge',
  component: Badge,
  args: {
    status: 'active',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'suspended', 'trial', 'expired', 'pending', 'paid', 'custom'],
    },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, alignItems: 'flex-start' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Active: Story = { args: { status: 'active' } };
export const Inactive: Story = { args: { status: 'inactive' } };
export const Suspended: Story = { args: { status: 'suspended' } };
export const Trial: Story = { args: { status: 'trial' } };
export const Expired: Story = { args: { status: 'expired' } };
export const Pending: Story = { args: { status: 'pending' } };
export const Paid: Story = { args: { status: 'paid' } };
export const Custom: Story = {
  args: {
    status: 'custom',
    label: 'Broiler',
    customColors: { text: '#1B3D1B', bg: '#E8F5E9' },
  },
};

export const AllStatuses: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {(['active', 'inactive', 'suspended', 'trial', 'expired', 'pending', 'paid'] as const).map(s => (
        <Badge key={s} status={s} />
      ))}
    </View>
  ),
};
