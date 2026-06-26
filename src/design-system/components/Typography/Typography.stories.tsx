import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import Typography from './Typography';

const meta: Meta<typeof Typography> = {
  title: 'Design System/Typography',
  component: Typography,
  args: {
    children: 'The quick brown fox',
    preset: 'bodyMd',
  },
  argTypes: {
    preset: {
      control: 'select',
      options: [
        'displayLg', 'displayMd',
        'headingLg', 'headingMd', 'headingSm',
        'bodyLg', 'bodyMd', 'bodySm',
        'labelLg', 'labelMd', 'labelSm',
        'caption',
      ],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const AllPresets: Story = {
  render: () => (
    <View style={{ padding: 16, gap: 8 }}>
      {(['displayLg', 'displayMd', 'headingLg', 'headingMd', 'headingSm',
        'bodyLg', 'bodyMd', 'bodySm', 'labelLg', 'labelMd', 'labelSm', 'caption'] as const).map(preset => (
        <View key={preset} style={{ marginBottom: 4 }}>
          <Typography preset="labelSm" color="#9E9E9E">{preset}</Typography>
          <Typography preset={preset}>Farm Management Dashboard</Typography>
        </View>
      ))}
    </View>
  ),
};

export const DisplayLg: Story = { args: { preset: 'displayLg', children: 'FarmCalcy' } };
export const HeadingMd: Story = { args: { preset: 'headingMd', children: 'Batch #7 — Cycle Report' } };
export const BodyMd: Story = { args: { preset: 'bodyMd', children: 'Total FCR: 1.82 | Mortality: 2.4%' } };
export const Caption: Story = { args: { preset: 'caption', children: 'Updated 26 Jun 2026' } };
export const Centered: Story = { args: { align: 'center', children: 'Centered label text' } };
export const CustomColor: Story = { args: { color: '#E67E22', children: 'Brand orange text' } };
