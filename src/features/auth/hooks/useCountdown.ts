import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountdownResult {
  /** Seconds remaining; 0 when finished. */
  secondsLeft: number;
  /** True while the countdown is running. */
  isRunning: boolean;
  /** (Re)starts the countdown from `initialSeconds` (or the provided value). */
  restart: (seconds?: number) => void;
}

/**
 * Self-cleaning 1-second countdown used to gate the "Resend OTP" action.
 * Starts immediately on mount with `initialSeconds`.
 */
export const useCountdown = (initialSeconds: number): UseCountdownResult => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    (seconds: number) => {
      clear();
      setSecondsLeft(seconds);
      if (seconds <= 0) {
        return;
      }
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clear();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [clear],
  );

  useEffect(() => {
    start(initialSeconds);
    return clear;
    // Run once on mount; `restart` handles subsequent restarts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restart = useCallback(
    (seconds?: number) => start(seconds ?? initialSeconds),
    [start, initialSeconds],
  );

  return { secondsLeft, isRunning: secondsLeft > 0, restart };
};
