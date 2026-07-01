import type { TileData } from '../lib/gameEngine';

interface TileProps {
  tile: TileData;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  onSelect: (tileId: string) => void;
  hideContext?: boolean;
}

export function Tile({ tile, selected, correct, wrong, onSelect, hideContext }: TileProps) {
  const className = [
    'tile',
    tile.context ? 'tile-has-context' : '',
    selected ? 'selected' : '',
    correct ? 'correct' : '',
    wrong ? 'wrong' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = tile.context
    ? `${tile.language} word: ${tile.text} (${tile.context})`
    : `${tile.language} word: ${tile.text}`;

  return (
    <button
      type="button"
      className={`${className}${tile.language === 'arabic' ? ' tile-arabic' : ''}`}
      onPointerDown={(e) => {
        e.preventDefault();
        onSelect(tile.id);
      }}
      aria-pressed={selected}
      aria-label={label}
    >
      <span className="tile-line">
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
