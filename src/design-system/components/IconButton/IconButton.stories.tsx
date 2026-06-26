import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import IconButton from './IconButton';

const meta: Meta<typeof IconButton> = {
  title: 'Design System/IconButton',
  component: IconButton,
  args: {
    name: 'dots-vertical',
    variant: 'ghost',
    size: 'md',
    disabled: false,
  },
  argTypes: {
    name: { control: 'text' },
    variant: {
      control: 'select',
      options: ['ghost', 'soft', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Ghost: Story = {
  args: { name: 'pencil-outline', variant: 'ghost', onPress: () => {} },
};

export const Soft: Story = {
  args: { name: 'filter-outline', variant: 'soft', onPress: () => {} },
};

export const Outlined: Story = {
  args: { name: 'plus', variant: 'outlined', onPress: () => {} },
};

export const Small: Story = {
  args: { name: 'close', size: 'sm', variant: 'ghost', onPress: () => {} },
};

export const Large: Story = {
  args: { name: 'arrow-left', size: 'lg', variant: 'ghost', onPress: () => {} },
};

export const Disabled: Story = {
  args: { name: 'delete-outline', variant: 'soft', disabled: true, onPress: () => {} },
};

export const CommonActions: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', gap: 8 }}>
      <IconButton name="arrow-left" variant="ghost" onPress={() => {}} />
      <IconButton name="pencil-outline" variant="soft" onPress={() => {}} />
      <IconButton name="delete-outline" variant="soft" color="#C62828" onPress={() => {}} />
      <IconButton name="dots-vertical" variant="ghost" onPress={() => {}} />
      <IconButton name="refresh" variant="outlined" onPress={() => {}} />
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ padding: 16, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <IconButton name="barn" size="sm" variant="soft" onPress={() => {}} />
      <IconButton name="barn" size="md" variant="soft" onPress={() => {}} />
      <IconButton name="barn" size="lg" variant="soft" onPress={() => {}} />
    </View>
  ),
};
