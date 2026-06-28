import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Avatar from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Design System/Avatar',
  component: Avatar,
  args: {
    name: 'Ramesh Kumar',
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    name: { control: 'text' },
    imageUri: { control: 'text' },
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
type Story = StoryObj<typeof Avatar>;

export const WithInitials: Story = { args: { name: 'Ramesh Kumar' } };
export const SingleName: Story = { args: { name: 'Supervisor' } };
export const ExtraSmall: Story = { args: { name: 'RK', size: 'xs' } };
export const Small: Story = { args: { name: 'Ramesh Kumar', size: 'sm' } };
export const Large: Story = { args: { name: 'Ramesh Kumar', size: 'lg' } };
export const ExtraLarge: Story = { args: { name: 'Farm Owner', size: 'xl' } };
export const CustomColors: Story = {
  args: {
    name: 'Naveen CB',
    size: 'lg',
    backgroundColor: '#E67E22',
    textColor: '#FFFFFF',
  },
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
        <Avatar key={size} name="Ramesh Kumar" size={size} />
      ))}
    </View>
  ),
};
