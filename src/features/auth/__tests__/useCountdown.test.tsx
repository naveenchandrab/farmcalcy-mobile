import { act, renderHook } from '@testing-library/react-native';

import { useCountdown } from '../hooks/useCountdown';

/**
 * useCountdown gates the "Resend OTP" action. It is timer-driven, so the tests
 * use fake timers to advance the clock deterministically (no real waiting) and
 * verify it self-cleans on unmount (no leaked intervals → no act() warnings).
 */
describe('useCountdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    // Drop pending intervals WITHOUT firing them (firing would trigger a
    // state update outside act); the hook's own cleanup clears them on unmount.
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('starts at the initial value and is running', () => {
    const { result } = renderHook(() => useCountdown(30));
    expect(result.current.secondsLeft).toBe(30);
    expect(result.current.isRunning).toBe(true);
  });

  it('decrements once per second', () => {
    const { result } = renderHook(() => useCountdown(30));
    act(() => jest.advanceTimersByTime(3000));
    expect(result.current.secondsLeft).toBe(27);
  });

  it('stops at zero and reports not running', () => {
    const { result } = renderHook(() => useCountdown(2));
    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('restarts from the initial value', () => {
    const { result } = renderHook(() => useCountdown(30));
    act(() => jest.advanceTimersByTime(30000));
    expect(result.current.isRunning).toBe(false);

    act(() => result.current.restart());
    expect(result.current.secondsLeft).toBe(30);
    expect(result.current.isRunning).toBe(true);
  });

  it('restarts from an explicit value', () => {
    const { result } = renderHook(() => useCountdown(30));
    act(() => result.current.restart(10));
    expect(result.current.secondsLeft).toBe(10);
  });

  it('treats an initial value of 0 as already finished', () => {
    const { result } = renderHook(() => useCountdown(0));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('clears its interval on unmount', () => {
    const clearSpy = jest.spyOn(globalThis, 'clearInterval');
    const { unmount } = renderHook(() => useCountdown(30));
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
