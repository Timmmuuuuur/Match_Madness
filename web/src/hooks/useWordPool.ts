import { useMemo } from 'react';
import type { WordPoolId } from '@shared/types';
import { resolveWordPool } from '@shared/wordPools';

export function useWordPool(poolId: WordPoolId) {
  return useMemo(() => resolveWordPool(poolId), [poolId]);
}
