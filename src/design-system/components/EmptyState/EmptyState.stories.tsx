import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import EmptyState from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Design System/EmptyState',
  component: EmptyState,
  args: {
    icon: 'inbox-outline',
    title: 'No data found',
  },
  argTypes: {
    icon: { control: 'text' },
    title: { control: 'text' },
    description: { control: 'text' },
    actionLabel: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: { title: 'No data found', description: 'There are no records to display.' },
};

export const WithAction: Story = {
  args: {
    icon: 'plus-circle-outline',
    title: 'No farms yet',
    description: 'Add your first farm to start managing poultry batches.',
    actionLabel: 'Add Farm',
  },
};

export const NoBatches: Story = {
  args: {
    icon: 'egg-outline',
    title: 'No active batches',
    description: 'All batches have been completed. Start a new cycle to continue.',
    actionLabel: 'Start New Cycle',
  },
};

export const NoResults: Story = {
  args: {
    icon: 'magnify',
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you\'re looking for.',
  },
};

export const NoUsers: Story = {
  args: {
    icon: 'account-group-outline',
    title: 'No users yet',
    description: 'Invite supervisors and farmers to manage this company.',
    actionLabel: 'Invite User',
  },
};
