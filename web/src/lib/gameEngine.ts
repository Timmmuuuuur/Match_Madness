import type { WordPair } from '@shared/types';

export interface TileData {
  id: string;
  pairId: number;
  text: string;
  language: 'french' | 'english';
  side: 'left' | 'right';
  article?: string;   // French article (le, la, l', les) — only on French tiles
  context?: string;   // disambiguation note for multi-meaning words
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickRandomPairs(words: WordPair[], count: number): WordPair[] {
  return shuffle(words).slice(0, Math.min(count, words.length));
}

function makeTiles(pairs: WordPair[]): Omit<TileData, 'side'>[] {
  const tiles: Omit<TileData, 'side'>[] = [];
  for (const pair of pairs) {
    tiles.push({ id: `${pair.id}-fr`, pairId: pair.id, text: pair.french, language: 'french', article: pair.article, context: pair.context });
    tiles.push({ id: `${pair.id}-en`, pairId: pair.id, text: pair.english, language: 'english', context: pair.context });
  }
  return tiles;
}

export function layoutColumns(
  pairs: WordPair[],
  direction: 'en-fr' | 'fr-en',
): { leftTiles: TileData[]; rightTiles: TileData[]; tileMap: Map<string, TileData> } {
  const all = makeTiles(pairs);
  const french = shuffle(all.filter((t) => t.language === 'french'));
  const english = shuffle(all.filter((t) => t.language === 'english'));
  const rawLeft = direction === 'en-fr' ? english : french;
  const rawRight = direction === 'en-fr' ? french : english;
  const leftTiles: TileData[] = rawLeft.map((t) => ({ ...t, side: 'left' as const }));
  const rightTiles: TileData[] = rawRight.map((t) => ({ ...t, side: 'right' as const }));
  const tileMap = new Map<string, TileData>([...leftTiles, ...rightTiles].map((t) => [t.id, t]));
  return { leftTiles, rightTiles, tileMap };
}

export function buildTiles(pairs: WordPair[]): TileData[] {
  return makeTiles(pairs).map((t) => ({ ...t, side: 'left' as const }));
}

export function isMatch(a: TileData, b: TileData): boolean {
  return a.pairId === b.pairId && a.language !== b.language;
}

export function calcMatchScore(streak: number): number {
  return 10 + Math.min(streak, 10) * 2;
}

export function pairToTiles(pair: WordPair, direction: 'en-fr' | 'fr-en'): { left: TileData; right: TileData } {
  const fr: Omit<TileData, 'side'> = {
    id: `${pair.id}-fr`,
    pairId: pair.id,
    text: pair.french,
    language: 'french',
    article: pair.article,
    context: pair.context,
  };
  const en: Omit<TileData, 'side'> = {
    id: `${pair.id}-en`,
    pairId: pair.id,
    text: pair.english,
    language: 'english',
    context: pair.context,
  };
  const leftRaw = direction === 'en-fr' ? en : fr;
  const rightRaw = direction === 'en-fr' ? fr : en;
  return {
    left: { ...leftRaw, side: 'left' },
    right: { ...rightRaw, side: 'right' },
  };
}

/** Swap a matched pair for a new one, keeping column positions (Duolingo-style refill). */
export function replacePairOnBoard(
  pairId: number,
  newPair: WordPair,
  leftTiles: TileData[],
  rightTiles: TileData[],
  direction: 'en-fr' | 'fr-en',
): { leftTiles: TileData[]; rightTiles: TileData[]; tileMap: Map<string, TileData> } {
  const { left, right } = pairToTiles(newPair, direction);
  const newLeft = leftTiles.map((t) => (t.pairId === pairId ? left : t));
  const newRight = rightTiles.map((t) => (t.pairId === pairId ? right : t));
  const tileMap = new Map<string, TileData>([...newLeft, ...newRight].map((t) => [t.id, t]));
  return { leftTiles: newLeft, rightTiles: newRight, tileMap };
}

export function pickNextPair(words: WordPair[], used: Set<number>): WordPair {
  const available = words.filter((w) => !used.has(w.id));
  const source = available.length > 0 ? available : words;
  return pickRandomPairs(source, 1)[0];
}
