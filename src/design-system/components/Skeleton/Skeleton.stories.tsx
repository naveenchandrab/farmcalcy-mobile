import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Skeleton, { ListItemSkeleton, CardSkeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'Design System/Skeleton',
  component: Skeleton,
  args: {
    width: '100%',
    height: 16,
  },
  argTypes: {
    height: { control: 'number' },
    width: { control: 'text' },
    borderRadius: { control: 'number' },
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
type Story = StoryObj<typeof Skeleton>;

export const TextLine: Story = { args: { width: '100%', height: 16 } };

export const Title: Story = { args: { width: '60%', height: 22 } };

export const Circle: Story = { args: { width: 44, height: 44, borderRadius: 22 } };

export const TextBlock: Story = {
  render: () => (
    <View style={{ gap: 8 }}>
      <Skeleton width="80%" height={20} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="60%" height={14} />
    </View>
  ),
};

export const ListItemSkeletonStory: Story = {
  name: 'ListItemSkeleton',
  render: () => (
    <View style={{ gap: 4 }}>
      <ListItemSkeleton />
      <ListItemSkeleton />
      <ListItemSkeleton />
    </View>
  ),
};

export const CardSkeletonStory: Story = {
  name: 'CardSkeleton',
  render: () => (
    <View style={{ gap: 12 }}>
      <CardSkeleton />
      <CardSkeleton />
    </View>
  ),
};
