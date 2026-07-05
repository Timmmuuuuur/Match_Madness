import { useMemo } from 'react';
import type { SpeechLang } from '@shared/types';
import { segmentFrenchText, type VocabEntry } from '../lib/readingText';
import { SpeakButton } from './SpeakButton';
import { speakText } from '../lib/speech';

interface ReadingFrenchTextProps {
  text: string;
  vocab: VocabEntry[];
  lang?: SpeechLang;
}

export function ReadingFrenchText({ text, vocab, lang = 'fr' }: ReadingFrenchTextProps) {
  const segments = useMemo(() => segmentFrenchText(text, vocab), [text, vocab]);

  return (
    <p>
      {segments.map((seg, i) => {
        if (seg.type === 'text') {
          return <span key={i}>{seg.value}</span>;
        }

        const speak = seg.speak ?? seg.value;
        return (
          <span
            key={i}
            className="reading-highlight"
            title={seg.en}
            role="button"
            tabIndex={0}
            onClick={() => speakText(speak, lang)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                speakText(speak, lang);
              }
            }}
          >
            {seg.value}
            <SpeakButton text={speak} lang={lang} compact />
          </span>
        );
      })}
    </p>
  );
}
