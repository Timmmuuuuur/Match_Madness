import type { WordPair, WordPool, WordPoolId } from './types';
import words2000 from './data/words-2000.json';

const MASTER = (words2000 as WordPool).words;

/** Re-index ids to 1…n within an active pool (required for disjoint slices). */
function reindex(words: WordPair[]): WordPair[] {
  return words.map((w, i) => ({ ...w, id: i + 1 }));
}

export const POOL_OPTIONS: {
  id: WordPoolId;
  label: string;
  description: string;
}[] = [
  { id: '500', label: 'First 500', description: 'Most common French words' },
  { id: '500-2', label: 'Second 500', description: 'Words 501–1,000 by frequency' },
  { id: '1000', label: '1,000 words', description: 'First 1,000 (both 500s combined)' },
  { id: '1500', label: '1,500 words', description: 'Strong foundation' },
  { id: '2000', label: '2,000 words', description: 'Advanced pool' },
];

export function resolveWordPool(id: WordPoolId): WordPair[] {
  switch (id) {
    case '500':
      return reindex(MASTER.slice(0, 500));
    case '500-2':
      return reindex(MASTER.slice(500, 1000));
    case '1000':
      return MASTER.slice(0, 1000);
    case '1500':
      return MASTER.slice(0, 1500);
    case '2000':
      return MASTER;
    default:
      return reindex(MASTER.slice(0, 500));
  }
}

export function poolMeta(id: WordPoolId): { range: string; cumulative: boolean } {
  switch (id) {
    case '500':
      return { range: 'Rank 1–500 by frequency', cumulative: false };
    case '500-2':
      return { range: 'Rank 501–1,000 by frequency', cumulative: false };
    case '1000':
      return { range: 'Rank 1–1,000 (includes both 500 pools)', cumulative: true };
    case '1500':
      return { range: 'Rank 1–1,500 by frequency', cumulative: true };
    case '2000':
      return { range: 'Rank 1–2,000 by frequency', cumulative: true };
  }
}
