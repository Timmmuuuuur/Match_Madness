/**
 * Builds shared/data/topics.json from scripts/topic-data.mjs + topic-expansions.json
 * Run: node scripts/build-topics.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOPIC_DEFINITIONS } from './topic-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../shared/data/topics.json');
const EXPANSIONS_PATH = join(__dirname, '../shared/data/topic-expansions.json');

const expansionsData = JSON.parse(readFileSync(EXPANSIONS_PATH, 'utf8'));
const EXPANSIONS = expansionsData.expansions ?? {};

function defaultExamples(word) {
  const head = word.article ? `${word.article}${word.french}` : word.french;
  if (word.english.startsWith('to ')) {
    const en = word.english.slice(3);
    return {
      exampleFr: `J'aime ${word.french}.`,
      exampleEn: `I like to ${en}.`,
    };
  }
  if (word.french.includes(' ')) {
    return { exampleFr: head, exampleEn: word.english };
  }
  return {
    exampleFr: `C'est ${head}.`,
    exampleEn: `It's ${word.english}.`,
  };
}

function mergeWords(base, extra) {
  const map = new Map();
  for (const word of [...base, ...extra]) {
    const key = word.french.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...word });
    } else {
      map.set(key, { ...existing, ...word });
    }
  }
  return [...map.values()];
}

function toEntry(word, id) {
  const entry = {
    id,
    french: word.french,
    english: word.english,
  };
  if (word.article) entry.article = word.article;
  if (word.context) entry.context = word.context;
  const ex = word.exampleFr && word.exampleEn
    ? { exampleFr: word.exampleFr, exampleEn: word.exampleEn }
    : defaultExamples(word);
  entry.exampleFr = ex.exampleFr;
  entry.exampleEn = ex.exampleEn;
  return entry;
}

let globalId = 1;
const topics = TOPIC_DEFINITIONS.map((def) => {
  const extra = EXPANSIONS[def.id] ?? [];
  const merged = mergeWords(def.words, extra);
  const words = merged.map((word) => toEntry(word, globalId++));

  return {
    id: def.id,
    label: def.label,
    frenchLabel: def.frenchLabel,
    emoji: def.emoji,
    accent: def.accent,
    description: def.description,
    theory: def.theory,
    words,
  };
});

const payload = {
  meta: {
    version: 2,
    topicCount: topics.length,
    languagePair: 'en-fr',
    description: 'Topic-stratified vocabulary with examples for matching and lookup.',
  },
  topics,
};

writeFileSync(OUT, JSON.stringify(payload, null, 2));

const wordCount = topics.reduce((n, t) => n + t.words.length, 0);
console.log(`Built ${topics.length} topics, ${wordCount} words → ${OUT}`);
