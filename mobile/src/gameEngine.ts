export type PoolSize = 500 | 1000 | 1500 | 2000;
export type Direction = 'en-fr' | 'fr-en';

export interface WordPair {
  id: number;
  french: string;
  english: string;
}

export interface TileData {
  id: string;
  pairId: number;
  text: string;
  language: 'french' | 'english';
  side: 'left' | 'right';
}

export const POOL_SIZES: PoolSize[] = [500, 1000, 1500, 2000];
export const PAIRS_PER_ROUND = 6;
export const TOTAL_ROUNDS = 5;
export const MAX_LIVES = 3;

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
    tiles.push({ id: `${pair.id}-fr`, pairId: pair.id, text: pair.french, language: 'french' });
    tiles.push({ id: `${pair.id}-en`, pairId: pair.id, text: pair.english, language: 'english' });
  }
  return tiles;
}

export function layoutColumns(
  pairs: WordPair[],
  direction: Direction,
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
