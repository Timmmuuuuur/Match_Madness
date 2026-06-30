import { useEffect } from 'react';

/** Prevent iOS scroll/bounce and viewport jitter during active play. */
export function useGameLayoutLock() {
  useEffect(() => {
    document.body.classList.add('game-active');
    return () => document.body.classList.remove('game-active');
  }, []);
}
