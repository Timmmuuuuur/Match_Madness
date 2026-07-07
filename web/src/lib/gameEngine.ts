import type { Direction, WordPair } from '@shared/types';

export type PrimaryLang = 'french' | 'english' | 'arabic' | 'kazakh' | 'russian' | 'korean';

export interface TileData {
  id: string;
  pairId: number;
  text: string;
  language: PrimaryLang;
  side: 'left' | 'right';
  article?: string;
  context?: string;
}

export function primaryLangFromDirection(direction: Direction): Exclude<PrimaryLang, 'english'> {
  if (direction === 'en-ar' || direction === 'ar-en') return 'arabic';
  if (direction === 'en-kk' || direction === 'kk-en') return 'kazakh';
  if (direction === 'en-ru' || direction === 'ru-en') return 'russian';
  if (direction === 'en-ko' || direction === 'ko-en') return 'korean';
  return 'french';
}

function isEnglishFirst(direction: Direction): boolean {
  return direction === 'en-fr' || direction === 'en-ar' || direction === 'en-kk' || direction === 'en-ru' || direction === 'en-ko';
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

function makeTiles(pairs: WordPair[], primary: Exclude<PrimaryLang, 'english'>): Omit<TileData, 'side'>[] {
  const tiles: Omit<TileData, 'side'>[] = [];
  for (const pair of pairs) {
    tiles.push({
      id: `${pair.id}-primary`,
      pairId: pair.id,
      text: pair.french,
      language: primary,
      article: primary === 'french' ? pair.article : undefined,
      context: pair.context,
    });
    tiles.push({
      id: `${pair.id}-en`,
      pairId: pair.id,
      text: pair.english,
      language: 'english',
      context: pair.context,
    });
  }
  return tiles;
}

export function layoutColumns(
  pairs: WordPair[],
  direction: Direction,
): { leftTiles: TileData[]; rightTiles: TileData[]; tileMap: Map<string, TileData> } {
  const primary = primaryLangFromDirection(direction);
  const all = makeTiles(pairs, primary);
  const primaryTiles = shuffle(all.filter((t) => t.language !== 'english'));
  const english = shuffle(all.filter((t) => t.language === 'english'));
  const rawLeft = isEnglishFirst(direction) ? english : primaryTiles;
  const rawRight = isEnglishFirst(direction) ? primaryTiles : english;
  const leftTiles: TileData[] = rawLeft.map((t) => ({ ...t, side: 'left' as const }));
  const rightTiles: TileData[] = rawRight.map((t) => ({ ...t, side: 'right' as const }));
  const tileMap = new Map<string, TileData>([...leftTiles, ...rightTiles].map((t) => [t.id, t]));
  return { leftTiles, rightTiles, tileMap };
}

export function buildTiles(pairs: WordPair[], direction: Direction = 'en-fr'): TileData[] {
  const primary = primaryLangFromDirection(direction);
  return makeTiles(pairs, primary).map((t) => ({ ...t, side: 'left' as const }));
}

export function isMatch(a: TileData, b: TileData): boolean {
  return a.pairId === b.pairId && a.language !== b.language;
}

export function calcMatchScore(streak: number): number {
  return 10 + Math.min(streak, 10) * 2;
}

export function pairToTiles(pair: WordPair, direction: Direction): { left: TileData; right: TileData } {
  const primary = primaryLangFromDirection(direction);
  const primaryTile: Omit<TileData, 'side'> = {
    id: `${pair.id}-primary`,
    pairId: pair.id,
    text: pair.french,
    language: primary,
    article: primary === 'french' ? pair.article : undefined,
    context: pair.context,
  };
  const en: Omit<TileData, 'side'> = {
    id: `${pair.id}-en`,
    pairId: pair.id,
    text: pair.english,
    language: 'english',
    context: pair.context,
  };
  const leftRaw = isEnglishFirst(direction) ? en : primaryTile;
  const rightRaw = isEnglishFirst(direction) ? primaryTile : en;
  return {
    left: { ...leftRaw, side: 'left' },
    right: { ...rightRaw, side: 'right' },
  };
}

/** Swap element at index i with a random index != i (in-place). */
function swapWithRandom<T>(arr: T[], i: number): void {
  if (arr.length <= 1) return;
  let j = Math.floor(Math.random() * (arr.length - 1));
  if (j >= i) j += 1;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

export function replacePairOnBoard(
  pairId: number,
  newPair: WordPair,
  leftTiles: TileData[],
  rightTiles: TileData[],
  direction: Direction,
): { leftTiles: TileData[]; rightTiles: TileData[]; tileMap: Map<string, TileData> } {
  const { left, right } = pairToTiles(newPair, direction);
  const newLeft = leftTiles.map((t) => (t.pairId === pairId ? left : t));
  const newRight = rightTiles.map((t) => (t.pairId === pairId ? right : t));

  // Randomly reposition each new tile independently so they never land on the same row.
  const leftIdx = newLeft.findIndex((t) => t.pairId === newPair.id);
  const rightIdx = newRight.findIndex((t) => t.pairId === newPair.id);
  if (leftIdx !== -1) swapWithRandom(newLeft, leftIdx);
  if (rightIdx !== -1) swapWithRandom(newRight, rightIdx);
  // Ensure left and right new positions are different rows (retry once if they collide).
  const finalLeft = newLeft.findIndex((t) => t.pairId === newPair.id);
  const finalRight = newRight.findIndex((t) => t.pairId === newPair.id);
  if (finalLeft === finalRight && newRight.length > 1) {
    swapWithRandom(newRight, finalRight);
  }

  const tileMap = new Map<string, TileData>([...newLeft, ...newRight].map((t) => [t.id, t]));
  return { leftTiles: newLeft, rightTiles: newRight, tileMap };
}

export function pickNextPair(words: WordPair[], used: Set<number>, onBoard?: Set<number>): WordPair {
  const boardIds = onBoard ?? new Set<number>();
  const available = words.filter((w) => !used.has(w.id) && !boardIds.has(w.id));
  const source = available.length > 0 ? available : words.filter((w) => !boardIds.has(w.id));
  const fallback = source.length > 0 ? source : words;
  return pickRandomPairs(fallback, 1)[0];
}
