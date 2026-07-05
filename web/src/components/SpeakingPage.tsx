import { useState } from 'react';
import { appPath } from '../lib/base';
import { SpeakButton } from './SpeakButton';
import { useTrack } from '../context/TrackContext';

interface Sentence {
  id: number;
  french: string;
  english: string;
  note?: string;
}

interface Section {
  id: string;
  label: string;
  frenchLabel: string;
  description: string;
  sentences: Sentence[];
}

export function SpeakingPage() {
  const track = useTrack();
  const sections = track.speaking.sections as Section[];
  const [activeId, setActiveId] = useState(sections[0]?.id ?? 'basics');
  const section = sections.find((s) => s.id === activeId) ?? sections[0];
  const langName = track.primaryLangName;

  return (
    <div className="screen speaking-screen">
      <header className="speaking-hero">
        <h1>Speaking</h1>
        <p className="subtitle">{track.speaking.meta.subtitle}</p>
      </header>

      {track.showBreakingBad && (
        <a href={appPath('/breaking-bad')} className="speaking-bb-promo card">
          <span className="speaking-bb-emoji">🧪</span>
          <span>
            <strong>Breaking Bad en français</strong>
            <span className="speaking-bb-desc">VF vocabulary &amp; iconic lines — cuistots, meth, chimie</span>
          </span>
          <span className="speaking-bb-arrow">→</span>
        </a>
      )}

      <div className="tense-tabs" role="tablist" aria-label="Section">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === activeId}
            className={`tense-tab${s.id === activeId ? ' active' : ''}`}
            onClick={() => setActiveId(s.id)}
          >
            <span className="tense-tab-en">{s.label}</span>
            <span className="tense-tab-fr">{s.frenchLabel}</span>
          </button>
        ))}
      </div>

      {section && (
        <section className="speaking-section card" role="tabpanel">
          <p className="speaking-section-desc">{section.description}</p>
          <ul className="speaking-list">
            {section.sentences.map((s) => (
              <li key={s.id} className="speaking-card">
                <div className="speaking-card-main">
                  <p className="speaking-fr">{s.french}</p>
                  <p className="speaking-en">{s.english}</p>
                  {s.note && <p className="speaking-note">{s.note}</p>}
                </div>
                <SpeakButton text={s.french} lang={track.ttsLang} label="Listen" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="speaking-footnote learn-callout learn-callout--tip">
        <span className="learn-callout-inner" style={{ display: 'block', padding: 0 }}>
          Pronunciation uses your device&apos;s built-in {langName} voice — no extra downloads. Works best with silent mode off on iPhone.
        </span>
      </p>
    </div>
  );
}
