import { useState } from 'react';
import bbData from '@shared/data/breaking-bad-vocab.json';
import { LearningProse } from './LearningProse';
import { SpeakButton } from './SpeakButton';

interface BBWord {
  french: string;
  english: string;
  context?: string;
  exampleFr?: string;
  exampleEn?: string;
  note?: string;
}

interface BBCategory {
  id: string;
  label: string;
  emoji: string;
  words: BBWord[];
}

interface BBQuote {
  french: string;
  english: string;
  speaker?: string;
  episode?: string;
  note?: string;
}

export function BreakingBadPage() {
  const [activeCat, setActiveCat] = useState(bbData.categories[0]?.id ?? '');

  const category = (bbData.categories as BBCategory[]).find((c) => c.id === activeCat)
    ?? (bbData.categories as BBCategory[])[0];

  return (
    <div className="screen collection-screen bb-screen">
      <header className="collection-hero bb-hero">
        <span className="collection-badge bb-badge">VF · Dubbing Brothers</span>
        <h1>{bbData.meta.title}</h1>
        <p className="subtitle">{bbData.meta.subtitle}</p>
        <p className="collection-meta">{bbData.meta.showTitleFr}</p>
      </header>

      <section className="card collection-intro">
        <LearningProse
          blocks={[
            {
              type: 'callout',
              variant: 'tip',
              text: 'Watch with French subtitles (VF) and tap 🔊 to hear terms. Quotes below are from the official French dub — S1E4 « Retour aux sources » and related VF scripts.',
            },
          ]}
        />
      </section>

      <div className="collection-cat-tabs">
        {(bbData.categories as BBCategory[]).map((c) => (
          <button
            key={c.id}
            type="button"
            className={`collection-cat-tab${c.id === activeCat ? ' active' : ''}`}
            onClick={() => setActiveCat(c.id)}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {category && (
        <section className="collection-words">
          <ul className="vocab-word-cards">
            {category.words.map((w) => (
              <li key={w.french} className="vocab-word-card">
                <div className="vocab-word-card-head">
                  <h3>{w.french}</h3>
                  <SpeakButton text={w.french} compact />
                </div>
                <p className="vocab-word-en">{w.english}</p>
                {w.context && <p className="vocab-word-ctx">{w.context}</p>}
                {w.exampleFr && (
                  <blockquote className="vocab-word-ex">
                    <p className="ex-fr">{w.exampleFr}</p>
                    {w.exampleEn && <p className="ex-en">{w.exampleEn}</p>}
                    {w.note && <p className="vocab-word-note">{w.note}</p>}
                  </blockquote>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {bbData.iconicQuotes?.length > 0 && (
        <section className="card bb-quotes">
          <h2>Iconic VF lines</h2>
          <ul className="bb-quote-list">
            {(bbData.iconicQuotes as BBQuote[]).map((q, i) => (
              <li key={i} className="bb-quote">
                <p className="bb-quote-fr">{q.french}</p>
                <p className="bb-quote-en">{q.english}</p>
                {q.speaker && (
                  <span className="bb-quote-meta">{q.speaker}{q.episode ? ` · ${q.episode}` : ''}</span>
                )}
                <SpeakButton text={q.french} label="Listen" compact />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
