import { useState } from 'react';
import tefData from '@shared/data/tef-tcf-vocab.json';
import { SpeakButton } from './SpeakButton';

interface TefWord {
  french: string;
  english: string;
  context?: string;
  exampleFr?: string;
  exampleEn?: string;
}

interface TefTheme {
  id: string;
  label: string;
  frenchLabel: string;
  emoji: string;
  level: string;
  words: TefWord[];
}

export function TefTcfPage() {
  const [activeTheme, setActiveTheme] = useState(tefData.themes[0]?.id ?? '');

  const theme = (tefData.themes as TefTheme[]).find((t) => t.id === activeTheme)
    ?? (tefData.themes as TefTheme[])[0];

  const totalWords = (tefData.themes as TefTheme[]).reduce((n, t) => n + t.words.length, 0);

  return (
    <div className="screen collection-screen tef-screen">
      <header className="collection-hero tef-hero">
        <span className="collection-badge tef-badge">TEF · TCF Canada</span>
        <h1>{tefData.meta.title}</h1>
        <p className="subtitle">{tefData.meta.subtitle}</p>
        <p className="collection-meta">{totalWords} exam-focused terms · {tefData.meta.levels}</p>
      </header>

      <div className="collection-cat-tabs">
        {(tefData.themes as TefTheme[]).map((t) => (
          <button
            key={t.id}
            type="button"
            className={`collection-cat-tab${t.id === activeTheme ? ' active' : ''}`}
            onClick={() => setActiveTheme(t.id)}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {theme && (
        <section className="collection-theme-head card">
          <h2>{theme.label}</h2>
          <p className="tef-theme-fr">{theme.frenchLabel}</p>
          <span className="tef-level-pill">{theme.level}</span>
        </section>
      )}

      {theme && (
        <ul className="vocab-word-cards">
          {theme.words.map((w) => (
            <li key={w.french} className="vocab-word-card tef-card">
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
                </blockquote>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
