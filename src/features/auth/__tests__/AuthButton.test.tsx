import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import AuthButton from '../components/AuthButton';

/** The primary CTA guards against double-submits and exposes a11y/loading state. */
describe('AuthButton', () => {
  it('renders the label and fires onPress', () => {
    const onPress = jest.fn();
    render(<AuthButton testID="cta" label="Login" onPress={onPress} />);

    expect(screen.getByText('Login')).toBeTruthy();
    fireEvent.press(screen.getByTestId('cta'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress while loading (prevents double submit)', () => {
    const onPress = jest.fn();
    render(<AuthButton testID="cta" label="Login" onPress={onPress} loading />);

    fireEvent.press(screen.getByTestId('cta'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not fire onPress while disabled', () => {
    const onPress = jest.fn();
    render(<AuthButton testID="cta" label="Login" onPress={onPress} disabled />);

    fireEvent.press(screen.getByTestId('cta'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes busy + disabled accessibility state while loading', () => {
    render(<AuthButton testID="cta" label="Login" onPress={jest.fn()} loading />);
    const state = screen.getByTestId('cta').props.accessibilityState;
    expect(state).toMatchObject({ busy: true, disabled: true });
  });

  it('runs the press-in / press-out animation handlers without error', () => {
    const onPress = jest.fn();
    render(<AuthButton testID="cta" label="Login" onPress={onPress} />);
    const button = screen.getByTestId('cta');

    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');
    fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
