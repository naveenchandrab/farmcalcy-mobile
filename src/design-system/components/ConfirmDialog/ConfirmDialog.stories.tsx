import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';

import Button from '../Button/Button';

import ConfirmDialog from './ConfirmDialog';


const meta: Meta<typeof ConfirmDialog> = {
  title: 'Design System/ConfirmDialog',
  component: ConfirmDialog,
  args: {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    destructive: false,
    loading: false,
  },
  argTypes: {
    destructive: { control: 'boolean' },
    loading: { control: 'boolean' },
    title: { control: 'text' },
    message: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Button onPress={() => setVisible(true)}>Open Dialog</Button>
        <ConfirmDialog
          {...args}
          visible={visible}
          onConfirm={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      </View>
    );
  },
};

export const Destructive: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Button variant="danger" onPress={() => setVisible(true)}>Delete Company</Button>
        <ConfirmDialog
          {...args}
          visible={visible}
          title="Delete Company"
          message="This will permanently delete all farms, batches, and contracts under this company. This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      </View>
    );
  },
};

export const WithLoading: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Button onPress={() => setVisible(true)}>Activate Company</Button>
        <ConfirmDialog
          {...args}
          visible={visible}
          title="Activate Company"
          message="This will activate the company and notify the tenant admin."
          confirmLabel="Activate"
          loading
          onConfirm={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      </View>
    );
  },
};

export const Logout: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Button variant="ghost" onPress={() => setVisible(true)}>Logout</Button>
        <ConfirmDialog
          {...args}
          visible={visible}
          title="Logout"
          message="Are you sure you want to logout?"
          confirmLabel="Logout"
          cancelLabel="Stay"
          onConfirm={() => setVisible(false)}
          onCancel={() => setVisible(false)}
        />
      </View>
    );
  },
};
