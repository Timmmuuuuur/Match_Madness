import { useMemo, useState } from 'react';
import { SpeakButton } from './SpeakButton';
import { ReadingFrenchText } from './ReadingFrenchText';
import { useTrack } from '../context/TrackContext';

interface Paragraph {
  french: string;
  english: string;
}

interface Article {
  id: number;
  title: string;
  subtitle: string;
  level: string;
  topic: string;
  source?: string;
  paragraphs: Paragraph[];
  vocab: Array<{ fr: string; en: string }>;
}

export function ReadingPage() {
  const track = useTrack();
  const data = track.reading;
  const articles = data.articles as Article[];
  const [activeId, setActiveId] = useState(articles[0]?.id ?? 1);
  const [showEnglish, setShowEnglish] = useState(true);

  const article = useMemo(
    () => articles.find((a) => a.id === activeId) ?? articles[0],
    [articles, activeId],
  );

  if (!article) return null;

  const idx = articles.findIndex((a) => a.id === activeId);
  const langLabel = track.id === 'french' ? 'Français' : track.label;

  return (
    <div className="screen reading-screen">
      <header className="reading-hero">
        <h1>Reading</h1>
        <p className="subtitle">{data.meta.subtitle}</p>
      </header>

      <div className="reading-picker">
        {articles.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`reading-pick${a.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(a.id)}
          >
            <span className="reading-pick-num">#{a.id}</span>
            <span className="reading-pick-title">{a.title}</span>
            <span className="reading-pick-meta">{a.level}</span>
          </button>
        ))}
      </div>

      <article className="reading-article card">
        <header className="reading-article-head">
          <span className="reading-article-label">Article {article.id} of {articles.length}</span>
          <h2>{article.title}</h2>
          <p className="reading-subtitle">{article.subtitle}</p>
          <div className="reading-tags">
            <span className="reading-tag reading-tag-level">{article.level}</span>
            <span className="reading-tag reading-tag-topic">{article.topic}</span>
          </div>
          {article.source && <p className="reading-source">{article.source}</p>}
        </header>

        <div className="reading-toolbar">
          <p className="reading-hint">Hover highlighted words for 🔊 — or tap on mobile.</p>
          <button
            type="button"
            className={`toggle-btn${showEnglish ? ' active' : ''}`}
            onClick={() => setShowEnglish((v) => !v)}
          >
            {showEnglish ? 'Side-by-side ON' : `${langLabel} only`}
          </button>
        </div>

        <div className={`reading-columns${showEnglish ? ' side-by-side' : ''}`}>
          {article.paragraphs.map((p, i) => (
            <div key={i} className="reading-para-row">
              <div className="reading-col reading-col-fr">
                <span className="reading-lang-label">{langLabel}</span>
                <ReadingFrenchText text={p.french} vocab={article.vocab} lang={track.ttsLang} />
              </div>
              {showEnglish && (
                <div className="reading-col reading-col-en">
                  <span className="reading-lang-label">English</span>
                  <p>{p.english}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {article.vocab.length > 0 && (
          <section className="reading-vocab">
            <h3>Key vocabulary</h3>
            <ul className="reading-vocab-grid">
              {article.vocab.map((v) => (
                <li key={v.fr} className="reading-vocab-item">
                  <span className="reading-vocab-fr">{v.fr}</span>
                  <span className="reading-vocab-en">{v.en}</span>
                  <SpeakButton text={v.fr} lang={track.ttsLang} compact />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="reading-nav">
          <button
            type="button"
            className="secondary-btn"
            disabled={idx <= 0}
            onClick={() => setActiveId(articles[idx - 1].id)}
          >
            ← Previous
          </button>
          <button
            type="button"
            className="primary-btn"
            disabled={idx >= articles.length - 1}
            onClick={() => setActiveId(articles[idx + 1].id)}
          >
            Next →
          </button>
        </div>
      </article>
    </div>
  );
}
