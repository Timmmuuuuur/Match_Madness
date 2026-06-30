import type { GameStats } from '@shared/types';

const BEST_KEY = 'match-madness-best';

export function loadBestScore(key: string | number): number {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, number>;
    return map[String(key)] ?? 0;
  } catch {
    return 0;
  }
}

export function saveBestScore(key: string | number, score: number): boolean {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const k = String(key);
    const current = map[k] ?? 0;
    if (score > current) {
      map[k] = score;
      localStorage.setItem(BEST_KEY, JSON.stringify(map));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function accuracy(stats: Pick<GameStats, 'correctMatches' | 'wrongMatches'>): number {
  const total = stats.correctMatches + stats.wrongMatches;
  if (total === 0) return 100;
  return Math.round((stats.correctMatches / total) * 100);
}
