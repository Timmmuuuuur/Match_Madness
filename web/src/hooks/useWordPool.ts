import { useMemo } from 'react';
import type { WordPoolId } from '@shared/types';
import { useTrack } from '../context/TrackContext';

export function useWordPool(poolId: WordPoolId) {
  const track = useTrack();
  return useMemo(() => track.getWords(poolId), [track, poolId]);
}
