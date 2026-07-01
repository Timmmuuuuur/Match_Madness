import type { LearningTrack } from '@shared/types';

/** Detect track from app route (after base strip). */
export function getTrackFromPath(path: string): LearningTrack | 'home' {
  if (path === '/' || path === '') return 'home';
  if (path === '/quran' || path.startsWith('/quran/')) return 'quran';
  if (path === '/french' || path.startsWith('/french/')) return 'french';
  // Legacy French routes (pre-track split)
  return 'french';
}

/** True if path is the mode picker home. */
export function isHomePath(path: string): boolean {
  return path === '/' || path === '';
}

/** Prefix path for a track (`/french/vocab`, `/quran/letters`). */
export function trackPath(track: LearningTrack, sub = ''): string {
  const base = track === 'french' ? '/french' : '/quran';
  if (!sub || sub === '/') return base;
  const clean = sub.startsWith('/') ? sub : `/${sub}`;
  return `${base}${clean}`;
}

/** Legacy French paths still work — map to same pages. */
export const LEGACY_FRENCH_PATHS = [
  '/vocab', '/reading', '/breaking-bad', '/tef-tcf', '/speaking', '/topics',
  '/pronunciation', '/grammar',
] as const;

export function isLegacyFrenchRoute(path: string): boolean {
  return LEGACY_FRENCH_PATHS.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

/** French match home: `/french` or legacy `/` when not home picker — handled in App. */
export function isFrenchMatchHome(path: string): boolean {
  return path === '/french' || path === '/french/';
}

/** Sub-route within French track (`/vocab`, `/`, …). */
export function frenchSubPath(path: string): string {
  if (path === '/french' || path === '/french/') return '/';
  if (path.startsWith('/french/')) return path.slice('/french'.length);
  return path;
}

/** Sub-route within Quran track (`/letters`, `/`, …). */
export function quranSubPath(path: string): string {
  if (path === '/quran' || path === '/quran/') return '/';
  if (path.startsWith('/quran/')) return path.slice('/quran'.length);
  return '/';
}
