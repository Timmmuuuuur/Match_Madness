import { useState } from 'react';
import sentencesData from '@shared/data/quran/sentences.json';
import { SpeakButton } from '../SpeakButton';

interface Sentence {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  rules?: string[];
  level: string;
}

const SENTENCES = sentencesData.sentences as Sentence[];

export function QuranSpeakingPage() {
  const [activeId, setActiveId] = useState(SENTENCES[0]?.id ?? '');
  const [showEnglish, setShowEnglish] = useState(true);

  const sentence = SENTENCES.find((s) => s.id === activeId) ?? SENTENCES[0];
  if (!sentence) return null;

  return (
    <div className="screen quran-screen">
      <header className="reading-hero">
        <h1>{sentencesData.meta.title}</h1>
        <p className="subtitle">{sentencesData.meta.subtitle}</p>
      </header>

      <div className="reading-picker">
        {SENTENCES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`reading-pick${s.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(s.id)}
          >
            <span className="reading-pick-title" dir="rtl" lang="ar">{s.arabic.slice(0, 24)}{s.arabic.length > 24 ? '…' : ''}</span>
            <span className="reading-pick-meta">{s.level}</span>
          </button>
        ))}
      </div>

      <article className="reading-article card quran-passage-card">
        <header className="reading-article-head">
          <span className="reading-tag reading-tag-level">{sentence.level}</span>
          <SpeakButton text={sentence.arabic} transliteration={sentence.transliteration} lang="ar" label="Listen to sentence" />
        </header>

        <div className="reading-toolbar">
          <button
            type="button"
            className={`toggle-btn${showEnglish ? ' active' : ''}`}
            onClick={() => setShowEnglish((v) => !v)}
          >
            {showEnglish ? 'Meaning ON' : 'Arabic only'}
          </button>
        </div>

        <div className="quran-passage-body">
          <p className="quran-passage-arabic" dir="rtl" lang="ar">{sentence.arabic}</p>
          <p className="quran-letter-translit">{sentence.transliteration}</p>
          {showEnglish && <p className="quran-passage-en">{sentence.english}</p>}
          {sentence.rules && sentence.rules.length > 0 && (
            <div className="quran-rules-section">
              <h3>Rules in this sentence</h3>
              <div className="quran-rule-tags">
                {sentence.rules.map((r) => (
                  <span key={r} className="quran-rule-tag">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
