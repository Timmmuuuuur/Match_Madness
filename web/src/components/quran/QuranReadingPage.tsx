import { useMemo, useState } from 'react';
import readingData from '@shared/data/quran/reading.json';
import { SpeakButton } from '../SpeakButton';

export function QuranReadingPage() {
  const passages = readingData.passages;
  const [activeId, setActiveId] = useState(passages[0]?.id ?? '');
  const [showEnglish, setShowEnglish] = useState(true);

  const passage = useMemo(
    () => passages.find((p) => p.id === activeId) ?? passages[0],
    [activeId, passages],
  );

  if (!passage) return null;

  return (
    <div className="screen quran-screen reading-screen">
      <header className="reading-hero">
        <h1>{readingData.meta.title}</h1>
        <p className="subtitle">{readingData.meta.subtitle}</p>
      </header>

      <div className="reading-picker">
        {passages.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`reading-pick${p.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(p.id)}
          >
            <span className="reading-pick-title">{p.title}</span>
            <span className="reading-pick-meta">{p.level}</span>
          </button>
        ))}
      </div>

      <article className="reading-article card quran-passage-card">
        <header className="reading-article-head">
          <h2>{passage.title}</h2>
          <SpeakButton text={passage.arabic} transliteration={passage.transliteration} lang="ar" label="Listen" />
          <span className="reading-tag reading-tag-level">{passage.level}</span>
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
          <p className="quran-passage-arabic" dir="rtl" lang="ar">{passage.arabic}</p>
          <p className="quran-letter-translit">{passage.transliteration}</p>
          {showEnglish && <p className="quran-passage-en">{passage.english}</p>}
          {passage.notes && <p className="quran-note">{passage.notes}</p>}
        </div>
      </article>
    </div>
  );
}
