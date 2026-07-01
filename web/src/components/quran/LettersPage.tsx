import lettersData from '@shared/data/quran/letters.json';
import { SpeakButton } from '../SpeakButton';

export function LettersPage() {
  return (
    <div className="screen quran-screen">
      <header className="reading-hero">
        <h1>{lettersData.meta.title}</h1>
        <p className="subtitle">{lettersData.meta.subtitle}</p>
      </header>

      <div className="quran-letter-grid">
        {lettersData.letters.map((letter) => (
          <article key={letter.order} className="quran-letter-card card">
            <span className="quran-letter-order">{letter.order}</span>
            <span className="quran-letter-glyph" dir="rtl" lang="ar">{letter.isolated}</span>
            <h3>{letter.name}</h3>
            <SpeakButton text={letter.example || letter.isolated} transliteration={`${letter.transliteration}a`} lang="ar" compact />
            <p className="quran-letter-translit">{letter.transliteration}</p>
            <p className="quran-letter-sound">{letter.sound}</p>
            {letter.example && (
              <p className="quran-letter-example" dir="rtl" lang="ar">
                {letter.example}
                {letter.exampleNote && <span className="quran-note"> — {letter.exampleNote}</span>}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
