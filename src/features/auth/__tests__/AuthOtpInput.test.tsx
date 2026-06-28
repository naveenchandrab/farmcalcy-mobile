import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';


import { TEST_IDS } from '@constants/testIDs';

import AuthOtpInput from '../components/AuthOtpInput';

/**
 * Component-level coverage for the OTP input's keyboard mechanics — paste,
 * digit-only filtering, auto-advance, backspace and the single onComplete fire —
 * which the screen test can't exercise cleanly through navigation.
 */
const ID = TEST_IDS.otp.input;

const Harness: React.FC<{ onComplete?: (v: string) => void }> = ({ onComplete }) => {
  const [value, setValue] = React.useState('');
  return (
    <AuthOtpInput
      testID={ID}
      value={value}
      onChange={setValue}
      onComplete={onComplete}
      autoFocus={false}
    />
  );
};

describe('AuthOtpInput', () => {
  it('renders one cell per digit', () => {
    render(<Harness />);
    for (let i = 0; i < 6; i += 1) {
      expect(screen.getByTestId(`${ID}-${i}`)).toBeTruthy();
    }
  });

  it('fills every cell from a pasted code', () => {
    render(<Harness />);
    fireEvent.changeText(screen.getByTestId(`${ID}-0`), '123456');
    expect(screen.getByTestId(`${ID}-0`).props.value).toBe('1');
    expect(screen.getByTestId(`${ID}-5`).props.value).toBe('6');
  });

  it('strips non-digits from a pasted value', () => {
    render(<Harness />);
    fireEvent.changeText(screen.getByTestId(`${ID}-0`), '12-34-56');
    expect(screen.getByTestId(`${ID}-5`).props.value).toBe('6');
  });

  it('ignores a non-digit single keystroke', () => {
    render(<Harness />);
    fireEvent.changeText(screen.getByTestId(`${ID}-0`), 'a');
    expect(screen.getByTestId(`${ID}-0`).props.value).toBe('');
  });

  it('clears the current digit on backspace', () => {
    render(<Harness />);
    fireEvent.changeText(screen.getByTestId(`${ID}-0`), '1');
    fireEvent(screen.getByTestId(`${ID}-0`), 'keyPress', {
      nativeEvent: { key: 'Backspace' },
    });
    expect(screen.getByTestId(`${ID}-0`).props.value).toBe('');
  });

  it('fires onComplete exactly once when the code is full', () => {
    const onComplete = jest.fn();
    render(<Harness onComplete={onComplete} />);
    fireEvent.changeText(screen.getByTestId(`${ID}-0`), '123456');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('removes the previous digit and steps back on backspace of an empty cell', () => {
    render(<Harness />);
    fireEvent.changeText(screen.getByTestId(`${ID}-0`), '12');
    // Cell 2 is empty; backspace there clears the digit in cell 1.
    fireEvent(screen.getByTestId(`${ID}-2`), 'keyPress', {
      nativeEvent: { key: 'Backspace' },
    });
    expect(screen.getByTestId(`${ID}-1`).props.value).toBe('');
  });

  it('focuses a cell when it is tapped', () => {
    render(<Harness />);
    fireEvent(screen.getByTestId(`${ID}-3`), 'focus');
    // A focused empty cell still renders (no crash); tapping focuses the input.
    fireEvent.press(screen.getByTestId(`${ID}-3`));
    expect(screen.getByTestId(`${ID}-3`)).toBeTruthy();
  });

  it('ignores a non-Backspace key press', () => {
    render(<Harness />);
    fireEvent.changeText(screen.getByTestId(`${ID}-0`), '1');
    fireEvent(screen.getByTestId(`${ID}-0`), 'keyPress', {
      nativeEvent: { key: 'Enter' },
    });
    expect(screen.getByTestId(`${ID}-0`).props.value).toBe('1');
  });

  it('renders an error message when provided', () => {
    render(
      <AuthOtpInput
        testID={ID}
        value=""
        onChange={jest.fn()}
        errorMessage="Invalid code"
        autoFocus={false}
      />,
    );
    expect(screen.getByText('Invalid code')).toBeTruthy();
  });
});
