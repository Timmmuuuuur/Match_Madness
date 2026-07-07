import type { Direction } from '@shared/types';

export function isEnglishFirst(direction: Direction): boolean {
  return (
    direction === 'en-fr'
    || direction === 'en-ar'
    || direction === 'en-kk'
    || direction === 'en-ru'
    || direction === 'en-ko'
  );
}

export function isArabicDirection(direction: Direction): boolean {
  return direction === 'en-ar' || direction === 'ar-en';
}

export function dirLabel(direction: Direction): string {
  const labels: Record<Direction, string> = {
    'en-fr': 'EN → FR',
    'fr-en': 'FR → EN',
    'en-ar': 'EN → AR',
    'ar-en': 'AR → EN',
    'en-kk': 'EN → KK',
    'kk-en': 'KK → EN',
    'en-ru': 'EN → RU',
    'ru-en': 'RU → EN',
    'en-ko': 'EN → KO',
    'ko-en': 'KO → EN',
  };
  return labels[direction];
}

export function primaryColumnLabel(direction: Direction): string {
  if (isEnglishFirst(direction)) return 'English';
  if (isArabicDirection(direction)) return 'Arabic';
  if (direction === 'kk-en') return 'Kazakh';
  if (direction === 'ru-en') return 'Russian';
  if (direction === 'ko-en') return 'Korean';
  return 'French';
}

export function secondaryColumnLabel(direction: Direction): string {
  if (isEnglishFirst(direction)) {
    if (isArabicDirection(direction)) return 'Arabic';
    if (direction === 'en-kk') return 'Kazakh';
    if (direction === 'en-ru') return 'Russian';
    if (direction === 'en-ko') return 'Korean';
    return 'French';
  }
  return 'English';
}
