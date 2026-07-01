import { useState } from 'react';
import vocabData from '@shared/data/quran/vocab.json';
import type { QuranWord } from '@shared/quran';
import { SpeakButton } from '../SpeakButton';

function RuleTags({ rules }: { rules?: string[] }) {
  if (!rules?.length) return null;
  return (
    <div className="quran-rule-tags">
      {rules.map((r) => (
        <span key={r} className="quran-rule-tag">{r.replace(/:/g, ' · ')}</span>
      ))}
    </div>
  );
}

function WordDetail({ word }: { word: QuranWord }) {
  return (
    <article className="card quran-word-detail">
      <header className="quran-word-detail-head">
        <p className="quran-vocab-arabic" dir="rtl" lang="ar">{word.arabic}</p>
        <SpeakButton text={word.arabic} transliteration={word.transliteration} lang="ar" />
        <p className="quran-vocab-en">{word.english}</p>
        <p className="quran-letter-translit">{word.transliteration}</p>
        <span className={`quran-length-badge quran-length-${word.length ?? 'medium'}`}>
          {word.length ?? 'medium'} word
        </span>
      </header>

      {word.ruleNote && (
        <section className="quran-rules-section">
          <h3>Reading rules</h3>
          <RuleTags rules={word.rules} />
          <p className="quran-rule-note">{word.ruleNote}</p>
        </section>
      )}

      {word.examples && word.examples.length > 0 && (
        <section className="quran-examples-section">
          <h3>Examples</h3>
          {word.examples.map((ex, i) => (
            <div key={i} className="quran-example-row">
              <p dir="rtl" lang="ar">{ex.arabic}</p>
              <p className="quran-letter-translit">{ex.transliteration}</p>
              <p className="quran-note">{ex.english}</p>
            </div>
          ))}
        </section>
      )}
    </article>
  );
}

export function QuranVocabPage() {
  const categories = vocabData.categories;
  const [activeCat, setActiveCat] = useState(categories[0]?.id ?? '');
  const [selectedId, setSelectedId] = useState<number | null>(categories[0]?.words[0]?.id ?? null);

  const category = categories.find((c) => c.id === activeCat) ?? categories[0];
  const words = (category?.words ?? []) as QuranWord[];
  const selected = words.find((w) => w.id === selectedId) ?? words[0] ?? null;

  return (
    <div className="screen quran-screen">
      <header className="reading-hero">
        <h1>{vocabData.meta.title}</h1>
        <p className="subtitle">{vocabData.meta.subtitle}</p>
        <p className="quran-meta-count">{vocabData.meta.wordCount} words · tap any word for rules & audio</p>
      </header>

      <div className="quran-vocab-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`toggle-btn${cat.id === activeCat ? ' active' : ''}`}
            onClick={() => {
              setActiveCat(cat.id);
              const first = cat.words[0] as QuranWord | undefined;
              setSelectedId(first?.id ?? null);
            }}
          >
            {cat.label} ({cat.words.length})
          </button>
        ))}
      </div>

      <div className="quran-vocab-layout">
        <div className="quran-vocab-list">
          {words.map((word) => (
            <button
              key={word.id}
              type="button"
              className={`quran-vocab-row card quran-vocab-row--btn${word.id === selected?.id ? ' active' : ''}`}
              onClick={() => setSelectedId(word.id)}
            >
              <p className="quran-vocab-arabic" dir="rtl" lang="ar">{word.arabic}</p>
              <div className="quran-vocab-meta">
                <p className="quran-vocab-en">{word.english}</p>
                <p className="quran-letter-translit">{word.transliteration}</p>
                <RuleTags rules={word.rules} />
              </div>
              <SpeakButton text={word.arabic} transliteration={word.transliteration} lang="ar" compact />
            </button>
          ))}
        </div>

        {selected && <WordDetail word={selected} />}
      </div>
    </div>
  );
}
