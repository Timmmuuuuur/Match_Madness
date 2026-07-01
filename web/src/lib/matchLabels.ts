import type { Direction } from '@shared/types';

export function isEnglishFirst(direction: Direction): boolean {
  return direction === 'en-fr' || direction === 'en-ar';
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
  };
  return labels[direction];
}

export function primaryColumnLabel(direction: Direction): string {
  if (isEnglishFirst(direction)) return 'English';
  return isArabicDirection(direction) ? 'Arabic' : 'French';
}

export function secondaryColumnLabel(direction: Direction): string {
  if (isEnglishFirst(direction)) {
    return isArabicDirection(direction) ? 'Arabic' : 'French';
  }
  return 'English';
}
