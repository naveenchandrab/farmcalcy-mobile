import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import AuthInput from '../components/AuthInput';
import Checkbox from '../components/Checkbox';

/**
 * Field-level coverage for the shared auth inputs: focus/blur state, the
 * error slot, the right-icon (password reveal) callback and the checkbox toggle.
 */
describe('AuthInput', () => {
  it('falls back to the placeholder for its accessibility label', () => {
    render(<AuthInput testID="email" leftIcon="email-outline" placeholder="Email Address" />);
    expect(screen.getByTestId('email').props.accessibilityLabel).toBe('Email Address');
  });

  it('forwards focus and blur events to the caller', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(
      <AuthInput
        testID="email"
        leftIcon="email-outline"
        placeholder="Email"
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );

    fireEvent(screen.getByTestId('email'), 'focus');
    fireEvent(screen.getByTestId('email'), 'blur');
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('renders an inline error message when provided', () => {
    render(
      <AuthInput
        testID="email"
        leftIcon="email-outline"
        placeholder="Email"
        errorMessage="Email is required"
      />,
    );
    expect(screen.getByText('Email is required')).toBeTruthy();
  });

  it('fires the right-icon callback (password reveal)', () => {
    const onRightIconPress = jest.fn();
    render(
      <AuthInput
        testID="pwd"
        rightIconTestID="pwd-toggle"
        leftIcon="lock-outline"
        rightIcon="eye-outline"
        onRightIconPress={onRightIconPress}
        placeholder="Password"
      />,
    );

    fireEvent.press(screen.getByTestId('pwd-toggle'));
    expect(onRightIconPress).toHaveBeenCalledTimes(1);
  });
});

describe('Checkbox', () => {
  it('toggles its value and exposes the checked accessibility state', () => {
    const onValueChange = jest.fn();
    const { rerender } = render(
      <Checkbox testID="remember" value={false} onValueChange={onValueChange} label="Remember me" />,
    );

    fireEvent.press(screen.getByTestId('remember'));
    expect(onValueChange).toHaveBeenCalledWith(true);

    rerender(
      <Checkbox testID="remember" value onValueChange={onValueChange} label="Remember me" />,
    );
    expect(screen.getByTestId('remember').props.accessibilityState).toMatchObject({
      checked: true,
    });
  });
});
