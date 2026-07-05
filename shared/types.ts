/** Which slice of the frequency-ranked master list to play. */
export type WordPoolId = '500' | '500-2' | '1000' | '1500' | '2000';

/** @deprecated Use WordPoolId */
export type PoolSize = 500 | 1000 | 1500 | 2000;

export type Direction = 'en-fr' | 'fr-en' | 'en-ar' | 'ar-en' | 'en-kk' | 'kk-en' | 'en-ru' | 'ru-en';

/** Top-level learning track. */
export type LearningTrack = 'french' | 'quran' | 'kazakh' | 'russian';

/** Browser TTS language codes used by SpeakButton. */
export type SpeechLang = 'fr' | 'ar' | 'kk' | 'ru';

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
  | { type: 'example'; fr: string; en: string; note?: string }
  | { type: 'tip'; text: string };

export interface Topic {
  id: string;
  label: string;
  frenchLabel: string;
  emoji: string;
  accent: string;
  description: string;
  /** Duolingo-style path: A1 → B2 */
  level?: 'A1' | 'A2' | 'B1' | 'B2';
  /** Unit number on the learning path */
  unit?: number;
  /** Sort order within the full curriculum */
  order?: number;
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
  /** When false, play until quit or matchGoal (Quran track). */
  timed?: boolean;
  /** Hide transliteration/context hints on tiles — harder mode. */
  hideHints?: boolean;
  /** End untimed game after N correct matches (optional). */
  matchGoal?: number;
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
