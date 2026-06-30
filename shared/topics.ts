import topicsData from './data/topics.json';
import type { Topic, WordPair } from './types';

export const TOPICS = topicsData.topics as Topic[];

export function getTopic(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
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
