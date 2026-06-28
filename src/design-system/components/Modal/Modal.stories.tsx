import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';


import Button from '../Button/Button';
import Typography from '../Typography/Typography';

import Modal from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Design System/Modal',
  component: Modal,
  args: {
    dismissible: true,
  },
  argTypes: {
    dismissible: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ alignItems: 'center' }}>
        <Button onPress={() => setVisible(true)}>Open Modal</Button>
        <Modal {...args} visible={visible} onClose={() => setVisible(false)}>
          <Typography preset="headingMd" style={{ marginBottom: 12 }}>Batch Details</Typography>
          <Typography preset="bodyMd" color="#666">Confirm that you want to proceed with closing Batch #7. This action will mark the cycle as complete.</Typography>
          <Button onPress={() => setVisible(false)} style={{ marginTop: 16 }}>Close</Button>
        </Modal>
      </View>
    );
  },
};

export const WithForm: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ alignItems: 'center' }}>
        <Button variant="secondary" onPress={() => setVisible(true)}>Add Note</Button>
        <Modal {...args} visible={visible} onClose={() => setVisible(false)}>
          <Typography preset="headingSm" style={{ marginBottom: 16 }}>Add Supervisor Note</Typography>
          <Typography preset="bodySm" color="#888" style={{ marginBottom: 16 }}>Observed during farm visit on 26 Jun 2026</Typography>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <Button variant="outline" onPress={() => setVisible(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button onPress={() => setVisible(false)} style={{ flex: 1 }}>Save</Button>
          </View>
        </Modal>
      </View>
    );
  },
};

export const NonDismissible: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ alignItems: 'center' }}>
        <Button onPress={() => setVisible(true)}>Open Non-Dismissible</Button>
        <Modal {...args} visible={visible} onClose={() => setVisible(false)} dismissible={false}>
          <Typography preset="headingSm" style={{ marginBottom: 12 }}>Action Required</Typography>
          <Typography preset="bodyMd" color="#666">You must confirm or cancel before continuing.</Typography>
          <Button onPress={() => setVisible(false)} style={{ marginTop: 16 }}>Got it</Button>
        </Modal>
      </View>
    );
  },
};
