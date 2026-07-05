import type { LearningTrack } from '@shared/types';
import {
  FRENCH_TRACK,
  getTrackConfigFromPath,
  KAZAKH_TRACK,
  RUSSIAN_TRACK,
  type LanguageTrackConfig,
} from '@shared/trackRegistry';

/** Detect track from app route (after base strip). */
export function getTrackFromPath(path: string): LearningTrack | 'home' {
  if (path === '/' || path === '') return 'home';
  if (path === '/quran' || path.startsWith('/quran/')) return 'quran';
  if (path === '/kazakh' || path.startsWith('/kazakh/')) return 'kazakh';
  if (path === '/russian' || path.startsWith('/russian/')) return 'russian';
  if (path === '/french' || path.startsWith('/french/')) return 'french';
  return 'french';
}

export function isHomePath(path: string): boolean {
  return path === '/' || path === '';
}

export function trackPath(track: LearningTrack, sub = ''): string {
  const bases: Record<LearningTrack, string> = {
    french: '/french',
    quran: '/quran',
    kazakh: '/kazakh',
    russian: '/russian',
  };
  const base = bases[track];
  if (!sub || sub === '/') return base;
  const clean = sub.startsWith('/') ? sub : `/${sub}`;
  return `${base}${clean}`;
}

export const LEGACY_FRENCH_PATHS = [
  '/vocab', '/reading', '/breaking-bad', '/tef-tcf', '/speaking', '/topics',
  '/pronunciation', '/grammar',
] as const;

export function isLegacyFrenchRoute(path: string): boolean {
  return LEGACY_FRENCH_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

export function isFrenchMatchHome(path: string): boolean {
  return path === '/french' || path === '/french/';
}

export function languageSubPath(path: string, base: string): string {
  if (path === base || path === `${base}/`) return '/';
  if (path.startsWith(`${base}/`)) return path.slice(base.length);
  return path;
}

export function frenchSubPath(path: string): string {
  return languageSubPath(path, '/french');
}

export function quranSubPath(path: string): string {
  return languageSubPath(path, '/quran');
}

export function kazakhSubPath(path: string): string {
  return languageSubPath(path, '/kazakh');
}

export function russianSubPath(path: string): string {
  return languageSubPath(path, '/russian');
}

export function getTrackConfigForPath(path: string): LanguageTrackConfig {
  return getTrackConfigFromPath(path) ?? FRENCH_TRACK;
}

export function subPathForTrack(path: string, track: LearningTrack): string {
  switch (track) {
    case 'quran':
      return quranSubPath(path);
    case 'kazakh':
      return kazakhSubPath(path);
    case 'russian':
      return russianSubPath(path);
    default:
      return frenchSubPath(path);
  }
}

export { FRENCH_TRACK, KAZAKH_TRACK, RUSSIAN_TRACK };
