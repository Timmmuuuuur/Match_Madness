interface HeartsProps {
  lives: number;
  maxLives?: number;
}

export function Hearts({ lives, maxLives = 3 }: HeartsProps) {
  return (
    <div className="hearts" aria-label={`${lives} lives remaining`}>
      {Array.from({ length: maxLives }, (_, i) => (
        <span key={i} className={i < lives ? 'heart full' : 'heart empty'}>
          ♥
        </span>
      ))}
    </div>
  );
}
