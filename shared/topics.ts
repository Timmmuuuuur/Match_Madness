import topicsData from './data/topics.json';
import type { Topic, WordPair } from './types';

export const TOPICS = (topicsData.topics as Topic[]).slice().sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);

export const UNIT_LABELS: Record<number, string> = {
  1: 'Survival French',
  2: 'Daily rhythm',
  3: 'People & home',
  4: 'Food & body',
  5: 'Around town',
  6: 'School & work',
  7: 'Travel & calendar',
  8: 'Nature & hobbies',
  9: 'Feelings & health',
  10: 'B1 expansion',
};

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

export function topicsByUnit(): Map<number, Topic[]> {
  const map = new Map<number, Topic[]>();
  for (const topic of TOPICS) {
    const unit = topic.unit ?? 99;
    const list = map.get(unit) ?? [];
    list.push(topic);
    map.set(unit, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }
  return map;
}

/** Merge words from selected topics, dedupe by French headword, re-index for gameplay. */
export function resolveTopicWords(topicIds: string[]): WordPair[] {
  const seen = new Set<string>();
  const merged: WordPair[] = [];

  for (const id of topicIds) {
    const topic = getTopic(id);
    if (!topic) continue;
    for (const word of topic.words) {
      const key = word.french.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ ...word });
    }
  }

  return merged.map((w, i) => ({ ...w, id: i + 1 }));
}

export function topicBestScoreKey(topicIds: string[]): string {
  return `topics:${[...topicIds].sort().join('+')}`;
}

export function countTopicWords(topicIds: string[]): number {
  return resolveTopicWords(topicIds).length;
}

export const ACCENT_LABELS: Record<string, string> = {
  blue: 'Sky',
  teal: 'Teal',
  green: 'Green',
  orange: 'Orange',
  amber: 'Gold',
  pink: 'Rose',
  purple: 'Violet',
  red: 'Coral',
  rose: 'Blush',
};
