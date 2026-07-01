import { useState } from 'react';
import practiceData from '@shared/data/quran/word-practice.json';
import type { QuranWord } from '@shared/quran';
import { SpeakButton } from '../SpeakButton';

type LengthKey = 'short' | 'medium' | 'long';

const TABS: { key: LengthKey; label: string }[] = [
  { key: 'short', label: 'Short words' },
  { key: 'medium', label: 'Medium words' },
  { key: 'long', label: 'Long words & phrases' },
];

export function WordPracticePage() {
  const [tab, setTab] = useState<LengthKey>('short');
  const words = (practiceData[tab] ?? []) as QuranWord[];
  const [selectedId, setSelectedId] = useState<number | null>(words[0]?.id ?? null);

  const selected = words.find((w) => w.id === selectedId) ?? words[0];

  return (
    <div className="screen quran-screen">
      <header className="reading-hero">
        <h1>{practiceData.meta.title}</h1>
        <p className="subtitle">{practiceData.meta.subtitle}</p>
      </header>

      <div className="quran-vocab-tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`toggle-btn${tab === key ? ' active' : ''}`}
            onClick={() => {
              setTab(key);
              const list = practiceData[key] as QuranWord[];
              setSelectedId(list[0]?.id ?? null);
            }}
          >
            {label} ({(practiceData[key] as QuranWord[]).length})
          </button>
        ))}
      </div>

      <div className="quran-practice-grid">
        {words.map((word) => (
          <button
            key={word.id}
            type="button"
            className={`quran-practice-card card${word.id === selected?.id ? ' active' : ''}`}
            onClick={() => setSelectedId(word.id)}
          >
            <p className="quran-vocab-arabic" dir="rtl" lang="ar">{word.arabic}</p>
            <p className="quran-letter-translit">{word.transliteration}</p>
            <SpeakButton text={word.arabic} transliteration={word.transliteration} lang="ar" compact />
          </button>
        ))}
      </div>

      {selected && (
        <article className="card quran-word-detail">
          <h2>{selected.english}</h2>
          <p className="quran-passage-arabic" dir="rtl" lang="ar">{selected.arabic}</p>
          <p className="quran-letter-translit">{selected.transliteration}</p>
          {selected.ruleNote && (
            <>
              <h3>How to read it</h3>
              <p className="quran-rule-note">{selected.ruleNote}</p>
            </>
          )}
          {selected.rules && (
            <div className="quran-rule-tags">
              {selected.rules.map((r) => (
                <span key={r} className="quran-rule-tag">{r}</span>
              ))}
            </div>
          )}
        </article>
      )}
    </div>
  );
}
