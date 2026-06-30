import type { PoolSize } from '@shared/types';
import type { WordPool } from '@shared/types';

import words500 from '../../shared/data/words-500.json';
import words1000 from '../../shared/data/words-1000.json';
import words1500 from '../../shared/data/words-1500.json';
import words2000 from '../../shared/data/words-2000.json';

const pools: Record<PoolSize, WordPool> = {
  500: words500 as WordPool,
  1000: words1000 as WordPool,
  1500: words1500 as WordPool,
  2000: words2000 as WordPool,
};

export function getWordPool(size: PoolSize) {
  return pools[size].words;
}
