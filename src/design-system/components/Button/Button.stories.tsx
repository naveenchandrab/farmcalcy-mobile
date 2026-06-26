import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  args: {
    children: 'Confirm Batch',
    variant: 'primary',
    size: 'md',
    fullWidth: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'financial'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Danger: Story = { args: { variant: 'danger', children: 'Delete Batch' } };
export const Financial: Story = { args: { variant: 'financial', children: 'Pay ₹1,20,000' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: 'sm', children: 'Edit' } };
export const Large: Story = { args: { size: 'lg', children: 'Submit Harvest' } };
export const FullWidth: Story = { args: { fullWidth: true } };
export const WithIconLeft: Story = { args: { iconLeft: 'plus', children: 'Add Cycle' } };
export const WithIconRight: Story = { args: { iconRight: 'arrow-right', children: 'Next Step' } };

export const AllVariants: Story = {
  render: () => (
    <View style={{ padding: 16, gap: 12 }}>
      {(['primary', 'secondary', 'outline', 'ghost', 'danger', 'financial'] as const).map(v => (
        <Button key={v} variant={v}>{v.charAt(0).toUpperCase() + v.slice(1)} Button</Button>
      ))}
    </View>
  ),
};
