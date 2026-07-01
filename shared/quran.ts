import vocabData from './data/quran/vocab.json';
import lettersData from './data/quran/letters.json';
import harakatData from './data/quran/harakat.json';
import type { WordPair } from './types';

export interface QuranWord {
  id: number;
  arabic: string;
  transliteration: string;
  english: string;
  context?: string;
  length?: 'short' | 'medium' | 'long';
  rules?: string[];
  ruleNote?: string;
  examples?: Array<{ arabic: string; transliteration: string; english: string }>;
}

export type QuranMatchMode =
  | 'vocab'
  | 'letters-glyphs'
  | 'letters-names'
  | 'harakat'
  | 'letter-harakat'
  | 'mixed';

export function getQuranVocabWords(): QuranWord[] {
  return vocabData.categories.flatMap((cat) => cat.words as QuranWord[]);
}

export function quranWordToPair(w: QuranWord, hideTransliteration = false): WordPair {
  return {
    id: w.id,
    french: w.arabic,
    english: w.english,
    context: hideTransliteration ? undefined : (w.context ?? w.transliteration),
  };
}

export function quranWordsToPairs(hideTransliteration = false): WordPair[] {
  return getQuranVocabWords().map((w) => quranWordToPair(w, hideTransliteration));
}

let letterPairId = 10000;

function letterPair(arabic: string, english: string, context?: string): WordPair {
  return { id: letterPairId++, french: arabic, english, context };
}

/** Isolated glyph ↔ letter name (e.g. ب ↔ baa). */
export function lettersGlyphToNamePairs(): WordPair[] {
  letterPairId = 10000;
  return lettersData.letters.map((l) =>
    letterPair(l.isolated, l.name, l.transliteration),
  );
}

/** Glyph ↔ transliteration (e.g. ب ↔ b). */
export function lettersGlyphToSoundPairs(): WordPair[] {
  letterPairId = 10100;
  return lettersData.letters.map((l) =>
    letterPair(l.isolated, l.transliteration, l.name),
  );
}

/** Letter + harakat example ↔ transliteration (e.g. بَ ↔ ba). */
export function letterHarakatPairs(): WordPair[] {
  letterPairId = 10200;
  const fromLetters = lettersData.letters
    .filter((l) => l.example)
    .map((l) => letterPair(l.example!, `${l.transliteration}a`, l.name));
  const fromHarakat = harakatData.marks.map((m) =>
    letterPair(m.example, m.transliteration, m.name),
  );
  return [...fromLetters, ...fromHarakat];
}

/** Harakat symbol ↔ name (e.g. َ ↔ Fatha). */
export function harakatPairs(): WordPair[] {
  letterPairId = 10300;
  return harakatData.marks.map((m) =>
    letterPair(m.symbol, m.name, m.transliteration),
  );
}

/** Harakat example ↔ English description. */
export function harakatReadingPairs(): WordPair[] {
  letterPairId = 10400;
  return harakatData.marks.map((m) =>
    letterPair(m.example, m.english, m.transliteration),
  );
}

export function resolveQuranMatchPool(mode: QuranMatchMode, hideHints: boolean): WordPair[] {
  switch (mode) {
    case 'letters-glyphs':
      return lettersGlyphToNamePairs();
    case 'letters-names':
      return lettersGlyphToSoundPairs();
    case 'harakat':
      return harakatPairs();
    case 'letter-harakat':
      return letterHarakatPairs();
    case 'mixed': {
      const pools = [
        lettersGlyphToNamePairs(),
        harakatPairs(),
        letterHarakatPairs(),
        quranWordsToPairs(hideHints).filter((w) => w.french.length <= 8),
      ];
      return pools.flat().map((p, i) => ({ ...p, id: i + 1 }));
    }
    case 'vocab':
    default:
      return quranWordsToPairs(hideHints);
  }
}

export function quranMatchModeLabel(mode: QuranMatchMode): string {
  const labels: Record<QuranMatchMode, string> = {
    vocab: 'Quranic vocabulary',
    'letters-glyphs': 'Letters — glyph ↔ name',
    'letters-names': 'Letters — glyph ↔ sound',
    harakat: 'Harakat — mark ↔ name',
    'letter-harakat': 'Letter + harakat drills',
    mixed: 'Mixed challenge',
  };
  return labels[mode];
}
