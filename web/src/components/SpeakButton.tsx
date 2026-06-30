import { useState } from 'react';
import { speakFrench, speechSupported } from '../lib/speech';

interface SpeakButtonProps {
  text: string;
  label?: string;
  compact?: boolean;
}

export function SpeakButton({ text, label = 'Listen', compact }: SpeakButtonProps) {
  const [busy, setBusy] = useState(false);
  const supported = speechSupported();

  if (!supported) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setBusy(true);
    await speakFrench(text);
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
