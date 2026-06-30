/** Which slice of the frequency-ranked master list to play. */
export type WordPoolId = '500' | '500-2' | '1000' | '1500' | '2000';

/** @deprecated Use WordPoolId */
export type PoolSize = 500 | 1000 | 1500 | 2000;

export type Direction = 'en-fr' | 'fr-en';

export interface WordPair {
  id: number;
  french: string;
  english: string;
  article?: string;  // definite article for French nouns (le, la, l', les)
  context?: string;  // disambiguation note for words with multiple meanings
  exampleFr?: string;
  exampleEn?: string;
}

/** Structured learning block for theory pages (topics, grammar, pronunciation). */
export type LearningBlock =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'callout'; variant: 'note' | 'tip' | 'warning' | 'compare-en' | 'compare-ru'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'rule'; title: string; text: string }
  | { type: 'example'; fr: string; en: string; note?: string };

export interface Topic {
  id: string;
  label: string;
  frenchLabel: string;
  emoji: string;
  accent: string;
  description: string;
  theory: LearningBlock[];
  words: WordPair[];
}

export interface GuideDocument {
  meta: {
    title: string;
    subtitle: string;
    accent: string;
  };
  sections: Array<{
    id: string;
    number?: number;
    title: string;
    blocks: LearningBlock[];
  }>;
}

export interface WordPool {
  meta: {
    size: number;
    targetSize: number;
    languagePair: string;
    source: string;
  };
  words: WordPair[];
}

export interface GameSettings {
  poolId: WordPoolId;
  direction: Direction;
  pairsPerRound: number;
  totalRounds: number;
}

export interface GameStats {
  score: number;
  correctMatches: number;
  wrongMatches: number;
  roundsCompleted: number;
  poolId: WordPoolId;
  direction: Direction;
  /** When playing topic-mixed pools */
  topicIds?: string[];
}
