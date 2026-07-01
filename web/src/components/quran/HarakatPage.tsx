import harakatData from '@shared/data/quran/harakat.json';
import type { LearningBlock } from '@shared/types';
import { LearningProse } from '../LearningProse';
import { SpeakButton } from '../SpeakButton';

export function HarakatPage() {
  const theory = harakatData.theory as LearningBlock[];

  return (
    <div className="screen quran-screen">
      <header className="reading-hero">
        <h1>{harakatData.meta.title}</h1>
        <p className="subtitle">{harakatData.meta.subtitle}</p>
      </header>

      <div className="quran-harakat-grid">
        {harakatData.marks.map((mark) => (
          <article key={mark.id} className="quran-harakat-card card">
            <span className="quran-harakat-symbol" dir="rtl" lang="ar">{mark.symbol}</span>
            <h3>{mark.name}</h3>
            <SpeakButton text={mark.example} transliteration={mark.transliteration} lang="ar" compact />
            <p className="quran-letter-sound">{mark.sound}</p>
            <p className="quran-letter-example" dir="rtl" lang="ar">{mark.example}</p>
            <p className="quran-letter-translit">{mark.transliteration} — {mark.english}</p>
          </article>
        ))}
      </div>

      <section className="card quran-theory-card">
        <h2>Quick rules</h2>
        <LearningProse blocks={theory} />
      </section>
    </div>
  );
}
