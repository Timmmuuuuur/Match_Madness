import { useMemo, useState } from 'react';
import words2000 from '@shared/data/words-2000.json';
import vocabDetails from '@shared/data/vocab-details.json';
import { TOPICS } from '@shared/topics';
import type { Topic, WordPair } from '@shared/types';
import { LearningProse } from './LearningProse';
import { SpeakButton } from './SpeakButton';
import { appPath } from '../lib/base';

interface VocabSense {
  meaning: string;
  connotation?: string;
  exampleFr?: string;
  exampleEn?: string;
}

interface VocabDetail {
  pos?: string;
  register?: string;
  primary?: string;
  note?: string;
  senses: VocabSense[];
}

type VocabView = 'frequency' | 'topics';

const ALL_WORDS = (words2000 as { words: WordPair[] }).words;
const DETAILS = vocabDetails.entries as Record<string, VocabDetail>;

const SPECIAL_COLLECTIONS = [
  {
    href: '/breaking-bad',
    emoji: '🧪',
    title: 'Breaking Bad VF',
    desc: 'Meth, chemistry, police slang — watch in French',
    accent: 'bb',
  },
  {
    href: '/tef-tcf',
    emoji: '📝',
    title: 'TEF / TCF',
    desc: 'Exam vocabulary for immigration & B1–B2',
    accent: 'tef',
  },
  {
    href: '/reading',
    emoji: '📖',
    title: 'Reading',
    desc: 'Graded articles with English side by side',
    accent: 'read',
  },
] as const;

function formatHeadword(w: Pick<WordPair, 'french' | 'article'>): string {
  return w.article ? `${w.article} ${w.french}` : w.french;
}

function WordDetailPanel({ selected }: { selected: WordPair }) {
  const detail = DETAILS[selected.french];
  const hasDetails = detail && detail.senses.length > 0;
  const hasTopicExample = Boolean(selected.exampleFr && selected.exampleEn);

  return (
    <article className="vocab-detail card">
      <header className="vocab-detail-head">
        <div className="vocab-detail-title">
          <h2>{formatHeadword(selected)}</h2>
          <SpeakButton text={formatHeadword(selected)} label="Pronounce" />
        </div>
        <p className="vocab-primary-en">{selected.english}</p>
        {selected.context && !hasDetails && (
          <p className="vocab-context">{selected.context}</p>
        )}
      </header>

      {hasTopicExample && (
        <blockquote className="sense-example vocab-topic-example">
          <p className="ex-fr">{selected.exampleFr}</p>
          <p className="ex-en">{selected.exampleEn}</p>
        </blockquote>
      )}

      {hasDetails ? (
        <div className="vocab-expanded">
          {detail.pos && <p className="vocab-meta"><strong>Part of speech:</strong> {detail.pos}</p>}
          {detail.register && <p className="vocab-meta"><strong>Register:</strong> {detail.register}</p>}
          {detail.note && <p className="vocab-note">{detail.note}</p>}

          <h3>Senses &amp; usage</h3>
          <ul className="vocab-senses">
            {detail.senses.map((s, i) => (
              <li key={i} className="vocab-sense">
                <p className="sense-meaning">{s.meaning}</p>
                {s.connotation && <p className="sense-connotation">{s.connotation}</p>}
                {s.exampleFr && s.exampleEn && (
                  <blockquote className="sense-example">
                    <p className="ex-fr">{s.exampleFr}</p>
                    <p className="ex-en">{s.exampleEn}</p>
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : !hasTopicExample ? (
        <div className="vocab-basic">
          <p className="vocab-lookup-note">
            Primary translation — context hints help disambiguate in the matching game.
          </p>
          {selected.context && (
            <p className="vocab-context"><strong>Hint:</strong> {selected.context}</p>
          )}
        </div>
      ) : null}

      {hasDetails && (
        <details className="vocab-quick-ref">
          <summary>Quick reference (game translation)</summary>
          <p>{selected.english}{selected.context ? ` — ${selected.context}` : ''}</p>
        </details>
      )}
    </article>
  );
}

function SpecialCollections() {
  return (
    <section className="vocab-collections" aria-label="Special vocabulary collections">
      {SPECIAL_COLLECTIONS.map((c) => (
        <a key={c.href} href={appPath(c.href)} className={`vocab-collection-card vocab-collection-${c.accent}`}>
          <span className="vocab-collection-emoji">{c.emoji}</span>
          <span className="vocab-collection-title">{c.title}</span>
          <span className="vocab-collection-desc">{c.desc}</span>
        </a>
      ))}
    </section>
  );
}

function FrequencyVocab({
  query,
  onQueryChange,
}: {
  query: string;
  onQueryChange: (q: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(ALL_WORDS[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_WORDS;
    return ALL_WORDS.filter(
      (w) =>
        w.french.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        (w.context?.toLowerCase().includes(q) ?? false),
    );
  }, [query]);

  const selected = ALL_WORDS.find((w) => w.id === selectedId) ?? filtered[0] ?? null;

  return (
    <>
      <div className="vocab-search-wrap">
        <input
          type="search"
          className="vocab-search"
          placeholder="Search French or English…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search vocabulary"
        />
        <span className="vocab-count">{filtered.length} entries</span>
      </div>

      <div className="vocab-layout">
        <ul className="vocab-list" role="listbox" aria-label="Word list">
          {filtered.slice(0, 120).map((w) => (
            <li key={w.id}>
              <div className={`vocab-row-wrap${selected?.id === w.id ? ' active' : ''}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected?.id === w.id}
                  className="vocab-row"
                  onClick={() => setSelectedId(w.id)}
                >
                  <span className="vocab-row-fr">{formatHeadword(w)}</span>
                  <span className="vocab-row-en">{w.english}</span>
                </button>
                <SpeakButton text={formatHeadword(w)} compact />
              </div>
            </li>
          ))}
          {filtered.length > 120 && (
            <li className="vocab-more">Refine search to see more — showing first 120 matches.</li>
          )}
          {filtered.length === 0 && (
            <li className="vocab-more">No matches. Try a shorter or different term.</li>
          )}
        </ul>

        {selected && <WordDetailPanel selected={selected} />}
      </div>
    </>
  );
}

function TopicWordCard({
  word,
  selected,
  onSelect,
}: {
  word: WordPair;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`topic-word-card topic-word-card--${selected ? 'selected' : 'idle'}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="topic-word-card-top">
        <span className="topic-word-fr">{formatHeadword(word)}</span>
        <SpeakButton text={formatHeadword(word)} compact />
      </div>
      <span className="topic-word-en">{word.english}</span>
      {word.context && <span className="topic-word-ctx">{word.context}</span>}
      {word.exampleFr && (
        <span className="topic-word-ex-preview">{word.exampleFr}</span>
      )}
    </button>
  );
}

function TopicVocab({ topic, query }: { topic: Topic; query: string }) {
  const [selectedId, setSelectedId] = useState<number | null>(topic.words[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topic.words;
    return topic.words.filter(
      (w) =>
        w.french.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        (w.context?.toLowerCase().includes(q) ?? false) ||
        (w.exampleFr?.toLowerCase().includes(q) ?? false),
    );
  }, [topic.words, query]);

  const selected = topic.words.find((w) => w.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="vocab-topic-panel">
      <header className={`vocab-topic-head topic-accent-${topic.accent}`}>
        <span className="vocab-topic-emoji">{topic.emoji}</span>
        <div>
          <h2>{topic.label}</h2>
          <p className="vocab-topic-fr">{topic.frenchLabel}</p>
          <p className="vocab-topic-desc">{topic.description}</p>
          <p className="vocab-topic-count">{topic.words.length} words with examples</p>
        </div>
      </header>

      {topic.theory.length > 0 && (
        <section className="card vocab-topic-theory">
          <h3 className="vocab-theory-title">What to know</h3>
          <LearningProse blocks={topic.theory} />
        </section>
      )}

      <div className="topic-words-grid">
        {filtered.map((w) => (
          <TopicWordCard
            key={w.id}
            word={w}
            selected={selected?.id === w.id}
            onSelect={() => setSelectedId(w.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="vocab-more">No matches in this topic.</p>
      )}

      {selected && (
        <div className="topic-detail-sticky">
          <WordDetailPanel selected={selected} />
        </div>
      )}
    </div>
  );
}

export function VocabPage() {
  const [view, setView] = useState<VocabView>('frequency');
  const [query, setQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(TOPICS[0]?.id ?? '');

  const activeTopic = TOPICS.find((t) => t.id === activeTopicId) ?? TOPICS[0];

  return (
    <div className="screen vocab-screen vocab-screen--wide">
      <header className="vocab-hero">
        <h1>Vocab</h1>
        <p className="subtitle">
          Frequency dictionary, 30 topic themes with examples, plus special collections for exams and pop culture.
        </p>
      </header>

      <SpecialCollections />

      <div className="vocab-view-tabs" role="tablist" aria-label="Vocabulary view">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'frequency'}
          className={`vocab-view-tab${view === 'frequency' ? ' active' : ''}`}
          onClick={() => setView('frequency')}
        >
          Frequency
          <span className="vocab-view-tab-sub">Top 2,000</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'topics'}
          className={`vocab-view-tab${view === 'topics' ? ' active' : ''}`}
          onClick={() => setView('topics')}
        >
          By topic
          <span className="vocab-view-tab-sub">{TOPICS.length} themes</span>
        </button>
      </div>

      {view === 'frequency' && (
        <FrequencyVocab query={query} onQueryChange={setQuery} />
      )}

      {view === 'topics' && activeTopic && (
        <>
          <div className="vocab-topic-nav-wrap">
            <div className="vocab-search-wrap vocab-topic-search">
              <input
                type="search"
                className="vocab-search"
                placeholder="Filter words in this topic…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Filter topic words"
              />
              <span className="vocab-count">{activeTopic.words.length} in {activeTopic.label}</span>
            </div>
            <div className="vocab-topic-chips" role="tablist" aria-label="Topics">
              {TOPICS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={t.id === activeTopicId}
                  className={`vocab-topic-chip topic-accent-${t.accent}${t.id === activeTopicId ? ' active' : ''}`}
                  onClick={() => {
                    setActiveTopicId(t.id);
                    setQuery('');
                  }}
                >
                  <span>{t.emoji}</span> {t.label}
                  <span className="vocab-chip-count">{t.words.length}</span>
                </button>
              ))}
            </div>
          </div>
          <TopicVocab topic={activeTopic} query={query} />
        </>
      )}
    </div>
  );
}
