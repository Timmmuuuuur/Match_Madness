import { useMemo, useState } from 'react';
import vocabDetails from '@shared/data/vocab-details.json';
import { topicsByUnitForTrack } from '@shared/trackRegistry';
import type { LanguageTrackConfig } from '@shared/trackRegistry';
import type { Topic, WordPair } from '@shared/types';
import type { SpeechLang } from '@shared/types';
import { LearningProse } from './LearningProse';
import { SpeakButton } from './SpeakButton';
import { appPath } from '../lib/base';
import { trackPath } from '../lib/tracks';
import { useTrack } from '../context/TrackContext';

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

const DETAILS = vocabDetails.entries as Record<string, VocabDetail>;

function formatHeadword(w: Pick<WordPair, 'french' | 'article'>): string {
  return w.article ? `${w.article} ${w.french}` : w.french;
}

function WordDetailPanel({ selected, ttsLang, showRichDetails }: { selected: WordPair; ttsLang: SpeechLang; showRichDetails: boolean }) {
  const detail = showRichDetails ? DETAILS[selected.french] : undefined;
  const hasDetails = detail && detail.senses.length > 0;
  const hasTopicExample = Boolean(selected.exampleFr && selected.exampleEn);

  return (
    <article className="vocab-detail card">
      <header className="vocab-detail-head">
        <div className="vocab-detail-title">
          <h2>{formatHeadword(selected)}</h2>
          <SpeakButton text={formatHeadword(selected)} lang={ttsLang} label="Pronounce" />
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

function SpecialCollections({ track }: { track: LanguageTrackConfig }) {
  const collections = [
    ...(track.showTefTcf
      ? [{
          href: trackPath(track.id, '/tef-tcf'),
          emoji: '📝',
          title: 'TEF / TCF',
          desc: 'Exam vocabulary for immigration & B1–B2',
          accent: 'tef',
        }]
      : []),
    {
      href: trackPath(track.id, '/reading'),
      emoji: '📖',
      title: 'Reading',
      desc: 'Graded articles with English side by side',
      accent: 'read',
    },
  ];

  if (collections.length === 0) return null;

  return (
    <section className="vocab-collections" aria-label="Special vocabulary collections">
      {collections.map((c) => (
        <a key={c.href} href={appPath(c.href)} className={`vocab-collection-card vocab-collection-${c.accent}`}>
          <span className="vocab-collection-emoji">{c.emoji}</span>
          <span className="vocab-collection-title">{c.title}</span>
          <span className="vocab-collection-desc">{c.desc}</span>
        </a>
      ))}
    </section>
  );
}

function WordList({
  words,
  selectedId,
  onSelect,
  ttsLang,
  limit = 120,
}: {
  words: WordPair[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  ttsLang: SpeechLang;
  limit?: number;
}) {
  const shown = words.slice(0, limit);

  return (
    <ul className="vocab-list" role="listbox" aria-label="Word list">
      {shown.map((w) => (
        <li key={w.id}>
          <div className={`vocab-row-wrap${selectedId === w.id ? ' active' : ''}`}>
            <button
              type="button"
              role="option"
              aria-selected={selectedId === w.id}
              className="vocab-row"
              onClick={() => onSelect(w.id)}
            >
              <span className="vocab-row-fr">{formatHeadword(w)}</span>
              <span className="vocab-row-en">{w.english}</span>
            </button>
            <SpeakButton text={formatHeadword(w)} lang={ttsLang} compact />
          </div>
        </li>
      ))}
      {words.length > limit && (
        <li className="vocab-more">Refine search to see more — showing first {limit} matches.</li>
      )}
      {words.length === 0 && (
        <li className="vocab-more">No matches. Try a shorter or different term.</li>
      )}
    </ul>
  );
}

function FrequencyVocab({
  query,
  onQueryChange,
  allWords,
  ttsLang,
  langName,
  showRichDetails,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  allWords: WordPair[];
  ttsLang: SpeechLang;
  langName: string;
  showRichDetails: boolean;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(allWords[0]?.id ?? null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allWords;
    return allWords.filter(
      (w) =>
        w.french.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        (w.context?.toLowerCase().includes(q) ?? false),
    );
  }, [allWords, query]);

  const selected = allWords.find((w) => w.id === selectedId) ?? filtered[0] ?? null;

  return (
    <>
      <div className="vocab-search-wrap">
        <input
          type="search"
          className="vocab-search"
          placeholder={`Search ${langName} or English…`}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Search vocabulary"
        />
        <span className="vocab-count">{filtered.length} entries</span>
      </div>

      <div className="vocab-layout">
        <WordList
          words={filtered}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          ttsLang={ttsLang}
        />
        {selected && (
          <WordDetailPanel selected={selected} ttsLang={ttsLang} showRichDetails={showRichDetails} />
        )}
      </div>
    </>
  );
}

function TopicVocab({ topic, query, ttsLang, showRichDetails }: { topic: Topic; query: string; ttsLang: SpeechLang; showRichDetails: boolean }) {
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
          <p className="vocab-topic-count">{topic.words.length} words · Unit {topic.unit} · {topic.level}</p>
        </div>
      </header>

      {topic.theory.length > 0 && (
        <section className="card vocab-topic-theory">
          <h3 className="vocab-theory-title">What to know</h3>
          <LearningProse blocks={topic.theory} />
        </section>
      )}

      <div className="vocab-layout">
        <WordList
          words={filtered}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          ttsLang={ttsLang}
          limit={200}
        />
        {selected && (
          <WordDetailPanel selected={selected} ttsLang={ttsLang} showRichDetails={showRichDetails} />
        )}
      </div>
    </div>
  );
}

export function VocabPage() {
  const track = useTrack();
  const TOPICS = track.topics;
  const UNIT_LABELS = track.unitLabels;
  const allWords = useMemo(() => track.getWords('1000'), [track]);
  const wordCountLabel = track.id === 'french' ? 'Top 2,000' : `Top ${allWords.length}`;
  const showRichDetails = track.id === 'french';

  const [view, setView] = useState<VocabView>('frequency');
  const [query, setQuery] = useState('');
  const [activeTopicId, setActiveTopicId] = useState(TOPICS[0]?.id ?? '');

  const activeTopic = TOPICS.find((t) => t.id === activeTopicId) ?? TOPICS[0];
  const unitMap = topicsByUnitForTrack(track);

  return (
    <div className="screen vocab-screen vocab-screen--wide">
      <header className="vocab-hero">
        <h1>Vocab</h1>
        <p className="subtitle">
          Frequency dictionary or follow the A1→B2 path by topic — each unit builds on the last.
        </p>
      </header>

      <SpecialCollections track={track} />

      <div className="vocab-view-tabs" role="tablist" aria-label="Vocabulary view">
        <button
          type="button"
          role="tab"
          aria-selected={view === 'frequency'}
          className={`vocab-view-tab${view === 'frequency' ? ' active' : ''}`}
          onClick={() => setView('frequency')}
        >
          Frequency
          <span className="vocab-view-tab-sub">{wordCountLabel}</span>
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
        <FrequencyVocab
          query={query}
          onQueryChange={setQuery}
          allWords={allWords}
          ttsLang={track.ttsLang}
          langName={track.primaryLangName}
          showRichDetails={showRichDetails}
        />
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
            <div className="vocab-topic-chips curriculum-chips" role="tablist" aria-label="Topics by unit">
              {[...unitMap.entries()].sort(([a], [b]) => a - b).map(([unit, unitTopics]) => (
                <div key={unit} className="curriculum-unit-group">
                  <p className="curriculum-unit-label">
                    Unit {unit} · {UNIT_LABELS[unit] ?? `Level ${unit}`}
                    <span className="curriculum-level">{unitTopics[0]?.level ?? ''}</span>
                  </p>
                  <div className="curriculum-unit-chips">
                    {unitTopics.map((t) => (
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
              ))}
            </div>
          </div>
          <TopicVocab topic={activeTopic} query={query} ttsLang={track.ttsLang} showRichDetails={showRichDetails} />
        </>
      )}
    </div>
  );
}
