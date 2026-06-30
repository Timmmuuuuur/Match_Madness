import { useMemo, useState } from 'react';
import type { GuideDocument } from '@shared/types';
import { LearningProse } from './LearningProse';

interface GuidePageProps {
  doc: GuideDocument;
}

export function GuidePage({ doc }: GuidePageProps) {
  const [activeId, setActiveId] = useState(doc.sections[0]?.id ?? '');

  const section = useMemo(
    () => doc.sections.find((s) => s.id === activeId) ?? doc.sections[0],
    [doc.sections, activeId],
  );

  return (
    <div className={`screen guide-screen guide-accent-${doc.meta.accent}`}>
      <header className="guide-hero">
        <span className={`guide-badge guide-badge--${doc.meta.accent}`}>{doc.meta.title}</span>
        <h1>{doc.meta.title}</h1>
        <p className="subtitle">{doc.meta.subtitle}</p>
      </header>

      <div className="guide-layout">
        <nav className="guide-toc card" aria-label="Sections">
          <p className="guide-toc-label">Contents</p>
          <ul>
            {doc.sections.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`guide-toc-link${s.id === activeId ? ' active' : ''}`}
                  onClick={() => setActiveId(s.id)}
                >
                  {s.number != null && <span className="guide-toc-num">{s.number}</span>}
                  <span>{s.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {section && (
          <article className="guide-article card">
            <header className="guide-section-head">
              {section.number != null && (
                <span className="guide-section-num">§ {section.number}</span>
              )}
              <h2>{section.title}</h2>
            </header>
            <LearningProse blocks={section.blocks} />
          </article>
        )}
      </div>
    </div>
  );
}
