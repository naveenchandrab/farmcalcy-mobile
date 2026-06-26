import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';
import { showSuccess, showError, showInfo, showWarning } from './Toast';

const ToastDemo: React.FC = () => (
  <View style={{ padding: 16, gap: 12 }}>
    <Typography preset="headingSm" style={{ marginBottom: 4 }}>Trigger Toasts</Typography>
    <Button onPress={() => showSuccess('Batch #7 saved successfully')}>
      Show Success
    </Button>
    <Button variant="danger" onPress={() => showError('Failed to sync. Check connection.')}>
      Show Error
    </Button>
    <Button variant="secondary" onPress={() => showInfo('Background sync started')}>
      Show Info
    </Button>
    <Button variant="outline" onPress={() => showWarning('Low connectivity detected')}>
      Show Warning
    </Button>
    <Button variant="ghost" onPress={() => showSuccess('Record updated', 5000)}>
      Success (5 sec)
    </Button>
  </View>
);

const meta: Meta<typeof ToastDemo> = {
  title: 'Design System/Toast',
  component: ToastDemo,
};

export default meta;
type Story = StoryObj<typeof ToastDemo>;

export const AllVariants: Story = {};
