import type { Direction, GuideDocument, LearningTrack, SpeechLang, WordPair, WordPoolId } from './types';
import frenchWords2000 from './data/words-2000.json';
import frenchSentences from './data/sentences.json';
import frenchTopics from './data/topics.json';
import frenchReading from './data/reading-articles.json';
import frenchGrammar from './data/guide-grammar.json';
import frenchPronunciation from './data/guide-pronunciation.json';
import frenchSpeaking from './data/speaking-sentences.json';
import kkWords1000 from './data/kazakh/words-1000.json';
import kkSentences from './data/kazakh/sentences.json';
import kkTopics from './data/kazakh/topics.json';
import kkReading from './data/kazakh/reading-articles.json';
import kkGrammar from './data/kazakh/guide-grammar.json';
import kkPronunciation from './data/kazakh/guide-pronunciation.json';
import kkSpeaking from './data/kazakh/speaking-sentences.json';
import ruWords1000 from './data/russian/words-1000.json';
import ruSentences from './data/russian/sentences.json';
import ruTopics from './data/russian/topics.json';
import ruReading from './data/russian/reading-articles.json';
import ruGrammar from './data/russian/guide-grammar.json';
import ruPronunciation from './data/russian/guide-pronunciation.json';
import ruSpeaking from './data/russian/speaking-sentences.json';
import koWords1000 from './data/korean/words-1000.json';
import koSentences from './data/korean/sentences.json';
import koTopics from './data/korean/topics.json';
import koReading from './data/korean/reading-articles.json';
import koGrammar from './data/korean/guide-grammar.json';
import koPronunciation from './data/korean/guide-pronunciation.json';
import koSpeaking from './data/korean/speaking-sentences.json';
import type { Topic } from './types';

export interface NavLink {
  href: string;
  label: string;
}

export interface ReadingData {
  meta: { title?: string; subtitle: string; sourceNote?: string };
  articles: Array<{
    id: number;
    title: string;
    subtitle: string;
    level: string;
    topic: string;
    source?: string;
    paragraphs: Array<{ french: string; english: string }>;
    vocab: Array<{ fr: string; en: string }>;
  }>;
}

export interface SpeakingData {
  meta: { title?: string; subtitle: string; languagePair?: string };
  sections: Array<{
    id: string;
    label: string;
    frenchLabel: string;
    description: string;
    sentences: Array<{ id: number; french: string; english: string; note?: string }>;
  }>;
}

export interface PoolOption {
  id: WordPoolId;
  label: string;
  description: string;
}

export interface LanguageTrackConfig {
  id: LearningTrack;
  label: string;
  flag: string;
  basePath: string;
  shellClass?: string;
  matchSubtitle: string;
  directions: { enPrimary: Direction; primaryEn: Direction };
  enPrimaryLabel: string;
  primaryEnLabel: string;
  primaryLangName: string;
  ttsLang: SpeechLang;
  navLinks: NavLink[];
  poolOptions: PoolOption[];
  /** French-specific extras shown only on French track */
  showBreakingBad?: boolean;
  showTefTcf?: boolean;
  getWords: (poolId: WordPoolId) => WordPair[];
  sentences: { meta: { size: number }; sentences: Array<{ id: number; french: string; english: string }> };
  topics: Topic[];
  unitLabels: Record<number, string>;
  reading: ReadingData;
  grammar: GuideDocument;
  pronunciation: GuideDocument;
  speaking: SpeakingData;
}

function reindex(words: WordPair[]): WordPair[] {
  return words.map((w, i) => ({ ...w, id: i + 1 }));
}

function slicePool(master: WordPair[], id: WordPoolId): WordPair[] {
  switch (id) {
    case '500':
      return reindex(master.slice(0, 500));
    case '500-2':
      return reindex(master.slice(500, 1000));
    case '1000':
      return master.slice(0, 1000);
    case '1500':
      return master.slice(0, Math.min(1500, master.length));
    case '2000':
      return master;
    default:
      return reindex(master.slice(0, 500));
  }
}

const FRENCH_MASTER = (frenchWords2000 as { words: WordPair[] }).words;

const STANDARD_NAV: NavLink[] = [
  { href: '', label: 'Match' },
  { href: '/topics', label: 'Topics' },
  { href: '/vocab', label: 'Vocab' },
  { href: '/reading', label: 'Reading' },
  { href: '/speaking', label: 'Speaking' },
  { href: '/pronunciation', label: 'Sounds' },
  { href: '/grammar', label: 'Grammar' },
];

const FRENCH_NAV: NavLink[] = [
  { href: '', label: 'Match' },
  { href: '/topics', label: 'Topics' },
  { href: '/vocab', label: 'Vocab' },
  { href: '/reading', label: 'Reading' },
  { href: '/breaking-bad', label: 'Breaking Bad' },
  { href: '/speaking', label: 'Speaking' },
  { href: '/tef-tcf', label: 'TEF/TCF' },
  { href: '/pronunciation', label: 'Sounds' },
  { href: '/grammar', label: 'Grammar' },
];

const KK_MASTER = (kkWords1000 as { words: WordPair[] }).words;
const RU_MASTER = (ruWords1000 as { words: WordPair[] }).words;
const KO_MASTER = (koWords1000 as { words: WordPair[] }).words;

const KK_TOPICS = (kkTopics as { topics: Topic[] }).topics.slice().sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);
const RU_TOPICS = (ruTopics as { topics: Topic[] }).topics.slice().sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);
const KO_TOPICS = (koTopics as { topics: Topic[] }).topics.slice().sort(
  (a, b) => (a.order ?? 999) - (b.order ?? 999),
);

export const FRENCH_TRACK: LanguageTrackConfig = {
  id: 'french',
  label: 'French',
  flag: '🇫🇷',
  basePath: '/french',
  matchSubtitle: 'English ↔ French — match, learn, look up',
  directions: { enPrimary: 'en-fr', primaryEn: 'fr-en' },
  enPrimaryLabel: 'English → French',
  primaryEnLabel: 'French → English',
  primaryLangName: 'French',
  ttsLang: 'fr',
  navLinks: FRENCH_NAV,
  showBreakingBad: true,
  showTefTcf: true,
  poolOptions: [
    { id: '500', label: 'Starter 500', description: 'A1–A2 essentials — greetings, family, food, time' },
    { id: '500-2', label: 'Builder 500', description: 'A2–B1 expansion — travel, work, feelings' },
    { id: '1000', label: '1,000 words', description: 'Starter + Builder combined' },
    { id: '1500', label: '1,500 words', description: 'Solid B1 foundation' },
    { id: '2000', label: '2,000 words', description: 'Full B1–B2 pool' },
  ],
  getWords: (id) => slicePool(FRENCH_MASTER, id),
  sentences: frenchSentences as LanguageTrackConfig['sentences'],
  topics: (frenchTopics as { topics: Topic[] }).topics.slice().sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999),
  ),
  unitLabels: {
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
  },
  reading: frenchReading as ReadingData,
  grammar: frenchGrammar as GuideDocument,
  pronunciation: frenchPronunciation as GuideDocument,
  speaking: frenchSpeaking as SpeakingData,
};

export const KAZAKH_TRACK: LanguageTrackConfig = {
  id: 'kazakh',
  label: 'Kazakh',
  flag: '🇰🇿',
  basePath: '/kazakh',
  shellClass: 'app-shell--kazakh',
  matchSubtitle: 'English ↔ Kazakh — match, learn, look up',
  directions: { enPrimary: 'en-kk', primaryEn: 'kk-en' },
  enPrimaryLabel: 'English → Kazakh',
  primaryEnLabel: 'Kazakh → English',
  primaryLangName: 'Kazakh',
  ttsLang: 'kk',
  navLinks: STANDARD_NAV,
  poolOptions: [
    { id: '500', label: 'First 500', description: 'Core Kazakh vocabulary' },
    { id: '1000', label: '1,000 words', description: 'Extended foundation' },
  ],
  getWords: (id) => slicePool(KK_MASTER, id),
  sentences: kkSentences as LanguageTrackConfig['sentences'],
  topics: KK_TOPICS,
  unitLabels: {
    1: 'First steps',
    2: 'Daily life',
    3: 'Body & travel',
    4: 'Work & city',
    5: 'Feelings & verbs',
  },
  reading: kkReading as ReadingData,
  grammar: kkGrammar as GuideDocument,
  pronunciation: kkPronunciation as GuideDocument,
  speaking: kkSpeaking as SpeakingData,
};

export const RUSSIAN_TRACK: LanguageTrackConfig = {
  id: 'russian',
  label: 'Russian',
  flag: '🇷🇺',
  basePath: '/russian',
  shellClass: 'app-shell--russian',
  matchSubtitle: 'English ↔ Russian — match, learn, look up',
  directions: { enPrimary: 'en-ru', primaryEn: 'ru-en' },
  enPrimaryLabel: 'English → Russian',
  primaryEnLabel: 'Russian → English',
  primaryLangName: 'Russian',
  ttsLang: 'ru',
  navLinks: STANDARD_NAV,
  poolOptions: [
    { id: '500', label: 'First 500', description: 'Core Russian vocabulary' },
    { id: '1000', label: '1,000 words', description: 'Extended foundation' },
  ],
  getWords: (id) => slicePool(RU_MASTER, id),
  sentences: ruSentences as LanguageTrackConfig['sentences'],
  topics: RU_TOPICS,
  unitLabels: {
    1: 'First steps',
    2: 'Daily life',
    3: 'Body & travel',
    4: 'Work & city',
    5: 'Feelings & verbs',
  },
  reading: ruReading as ReadingData,
  grammar: ruGrammar as GuideDocument,
  pronunciation: ruPronunciation as GuideDocument,
  speaking: ruSpeaking as SpeakingData,
};

export const KOREAN_TRACK: LanguageTrackConfig = {
  id: 'korean',
  label: 'Korean',
  flag: '🇰🇷',
  basePath: '/korean',
  shellClass: 'app-shell--korean',
  matchSubtitle: 'English ↔ Korean — match, learn, look up',
  directions: { enPrimary: 'en-ko', primaryEn: 'ko-en' },
  enPrimaryLabel: 'English → Korean',
  primaryEnLabel: 'Korean → English',
  primaryLangName: 'Korean',
  ttsLang: 'ko',
  navLinks: STANDARD_NAV,
  poolOptions: [
    { id: '500', label: 'First 500', description: 'Core Korean vocabulary' },
    { id: '1000', label: '1,000 words', description: 'Extended foundation' },
  ],
  getWords: (id) => slicePool(KO_MASTER, id),
  sentences: koSentences as LanguageTrackConfig['sentences'],
  topics: KO_TOPICS,
  unitLabels: {
    1: 'First steps',
    2: 'Daily life',
    3: 'Body & travel',
    4: 'Work & city',
    5: 'Feelings & verbs',
  },
  reading: koReading as ReadingData,
  grammar: koGrammar as GuideDocument,
  pronunciation: koPronunciation as GuideDocument,
  speaking: koSpeaking as SpeakingData,
};

const TRACKS: Record<LearningTrack, LanguageTrackConfig> = {
  french: FRENCH_TRACK,
  kazakh: KAZAKH_TRACK,
  russian: RUSSIAN_TRACK,
  korean: KOREAN_TRACK,
  quran: FRENCH_TRACK, // placeholder — quran uses separate components
};

export function getTrackConfig(track: LearningTrack): LanguageTrackConfig {
  return TRACKS[track] ?? FRENCH_TRACK;
}

export function getTrackConfigFromPath(path: string): LanguageTrackConfig | null {
  if (path === '/kazakh' || path.startsWith('/kazakh/')) return KAZAKH_TRACK;
  if (path === '/russian' || path.startsWith('/russian/')) return RUSSIAN_TRACK;
  if (path === '/korean' || path.startsWith('/korean/')) return KOREAN_TRACK;
  if (path === '/quran' || path.startsWith('/quran/')) return null;
  return FRENCH_TRACK;
}

export function resolveTopicWordsForTrack(track: LanguageTrackConfig, topicIds: string[]): WordPair[] {
  const seen = new Set<string>();
  const merged: WordPair[] = [];
  for (const id of topicIds) {
    const topic = track.topics.find((t) => t.id === id);
    if (!topic) continue;
    for (const word of topic.words) {
      const key = word.french.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ ...word, id: merged.length + 1 });
    }
  }
  return merged;
}

export function countTopicWordsForTrack(track: LanguageTrackConfig, topicIds: string[]): number {
  return resolveTopicWordsForTrack(track, topicIds).length;
}

export function topicsByUnitForTrack(track: LanguageTrackConfig): Map<number, Topic[]> {
  const map = new Map<number, Topic[]>();
  for (const topic of track.topics) {
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
