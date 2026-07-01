import { useRef } from 'react';
import type { TileData } from '../lib/gameEngine';
import { primeGameAudio } from '../lib/gameFeedback';

interface TileProps {
  tile: TileData;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  disabled?: boolean;
  onSelect: (tileId: string) => void;
  hideContext?: boolean;
}

export function Tile({ tile, selected, correct, wrong, disabled, onSelect, hideContext }: TileProps) {
  const lastTapRef = useRef(0);
  const isArabic = tile.language === 'arabic';

  const className = [
    'tile',
    tile.context && !hideContext ? 'tile-has-context' : '',
    isArabic ? 'tile-arabic' : '',
    selected ? 'selected' : '',
    correct ? 'correct' : '',
    wrong ? 'wrong' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = tile.context
    ? `${tile.language} word: ${tile.text} (${tile.context})`
    : `${tile.language} word: ${tile.text}`;

  const handleActivate = () => {
    if (disabled || correct || wrong) return;
    const now = Date.now();
    if (now - lastTapRef.current < 150) return;
    lastTapRef.current = now;
    onSelect(tile.id);
  };

  return (
    <button
      type="button"
      className={className}
      disabled={disabled || correct}
      onPointerDown={(e) => {
        primeGameAudio();
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        handleActivate();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
      aria-pressed={selected}
      aria-label={label}
    >
      <span className="tile-line" dir={isArabic ? 'rtl' : 'ltr'} lang={isArabic ? 'ar' : undefined}>
        {tile.language === 'french' && tile.article && (
          <span className="tile-article">{tile.article}&nbsp;</span>
        )}
        <span className="tile-text">{tile.text}</span>
        {!hideContext && tile.context && (
          <span className="tile-context">&nbsp;·&nbsp;{tile.context}</span>
        )}
      </span>
    </button>
  );
}
