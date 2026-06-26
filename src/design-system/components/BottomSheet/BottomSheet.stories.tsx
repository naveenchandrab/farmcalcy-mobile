import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import React from 'react';
import BottomSheet from './BottomSheet';
import Button from '../Button/Button';
import Typography from '../Typography/Typography';
import ListItem from '../ListItem/ListItem';

const meta: Meta<typeof BottomSheet> = {
  title: 'Design System/BottomSheet',
  component: BottomSheet,
  args: {
    snapPoint: 50,
  },
  argTypes: {
    snapPoint: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: 'flex-end', minHeight: 300 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BottomSheet>;

export const Default: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Button onPress={() => setVisible(true)}>Open Sheet</Button>
        <BottomSheet {...args} visible={visible} onClose={() => setVisible(false)}>
          <Typography preset="headingSm" style={{ marginBottom: 16 }}>Select Role</Typography>
          <View style={{ gap: 4 }}>
            <ListItem title="Tenant Admin" left="shield-account-outline" showDivider showChevron={false} onPress={() => setVisible(false)} />
            <ListItem title="Supervisor" left="account-check-outline" showDivider showChevron={false} onPress={() => setVisible(false)} />
            <ListItem title="Farmer" left="account-outline" showDivider={false} showChevron={false} onPress={() => setVisible(false)} />
          </View>
        </BottomSheet>
      </View>
    );
  },
};

export const TallSheet: Story = {
  render: (args) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Button variant="secondary" onPress={() => setVisible(true)}>Open Tall Sheet</Button>
        <BottomSheet {...args} visible={visible} onClose={() => setVisible(false)} snapPoint={70}>
          <Typography preset="headingSm" style={{ marginBottom: 12 }}>Batch History</Typography>
          {Array.from({ length: 8 }, (_, i) => (
            <ListItem
              key={i}
              title={`Batch #${i + 1}`}
              subtitle={`Closed ${i + 1} cycles ago`}
              left="egg-outline"
              showChevron={false}
              onPress={() => setVisible(false)}
            />
          ))}
        </BottomSheet>
      </View>
    );
  },
};
