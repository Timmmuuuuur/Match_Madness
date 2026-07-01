import { useState } from 'react';
import { speakText, speechSupported, type SpeechLang } from '../lib/speech';

interface SpeakButtonProps {
  text: string;
  /** Transliteration fallback for Arabic TTS */
  transliteration?: string;
  lang?: SpeechLang;
  label?: string;
  compact?: boolean;
}

export function SpeakButton({
  text,
  transliteration,
  lang = 'fr',
  label = 'Listen',
  compact,
}: SpeakButtonProps) {
  const [busy, setBusy] = useState(false);
  const supported = speechSupported();

  if (!supported) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    await speakText(text, lang, transliteration);
    window.setTimeout(() => setBusy(false), 300);
  };

  return (
    <button
      type="button"
      className={`speak-btn${compact ? ' speak-btn--compact' : ''}${busy ? ' speak-btn--busy' : ''}`}
      onClick={handleClick}
      aria-label={`Pronounce: ${text}`}
      title="Play pronunciation"
    >
      <span className="speak-icon" aria-hidden>🔊</span>
      {!compact && <span>{label}</span>}
    </button>
  );
}
