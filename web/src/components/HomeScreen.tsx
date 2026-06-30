import type { Direction, WordPoolId } from '@shared/types';
import { POOL_OPTIONS } from '@shared/wordPools';
import { loadBestScore } from '../lib/storage';

type GameMode = 'words' | 'sentences';

interface HomeScreenProps {
  poolId: WordPoolId;
  direction: Direction;
  mode: GameMode;
  onPoolIdChange: (id: WordPoolId) => void;
  onDirectionChange: (direction: Direction) => void;
  onModeChange: (mode: GameMode) => void;
  onStart: () => void;
}

export function HomeScreen({
  poolId,
  direction,
  mode,
  onPoolIdChange,
  onDirectionChange,
  onModeChange,
  onStart,
}: HomeScreenProps) {
  const bestKey = mode === 'sentences' ? `sent-${direction}` : poolId;
  const best = loadBestScore(bestKey);

  return (
    <div className="screen home-screen">
      <header className="hero">
        <div className="logo-badge">MM</div>
        <h1>Match Madness</h1>
        <p className="subtitle">English ↔ French — match, learn, look up</p>
      </header>

      <section className="card">
        <h2>Game mode</h2>
        <div className="toggle-row">
          <button type="button" className={`toggle-btn ${mode === 'words' ? 'active' : ''}`} onClick={() => onModeChange('words')}>Words</button>
          <button type="button" className={`toggle-btn ${mode === 'sentences' ? 'active' : ''}`} onClick={() => onModeChange('sentences')}>Sentences</button>
        </div>
      </section>

      {mode === 'words' && (
        <section className="card">
          <h2>Word pool</h2>
          <div className="option-grid pool-grid">
            {POOL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`option-btn ${poolId === opt.id ? 'active' : ''}`}
                onClick={() => onPoolIdChange(opt.id)}
              >
                <strong>{opt.label}</strong>
                <span>{opt.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {mode === 'sentences' && (
        <section className="card">
          <h2>Sentence pool</h2>
          <p className="hint" style={{ margin: 0 }}>200 common phrases — beginner to intermediate</p>
        </section>
      )}

      <section className="card">
        <h2>Direction</h2>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${direction === 'en-fr' ? 'active' : ''}`}
            onClick={() => onDirectionChange('en-fr')}
          >
            English → French
          </button>
          <button
            type="button"
            className={`toggle-btn ${direction === 'fr-en' ? 'active' : ''}`}
            onClick={() => onDirectionChange('fr-en')}
          >
            French → English
          </button>
        </div>
        <p className="hint">
          {direction === 'en-fr'
            ? 'English tiles appear on the left, French on the right.'
            : 'French tiles appear on the left, English on the right.'}
        </p>
      </section>

      <section className="stats-row">
        <div className="stat-pill">
          <span className="stat-label">Best score</span>
          <span className="stat-value">{best}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Timer</span>
          <span className="stat-value">{mode === 'words' ? '1:00' : 'None'}</span>
        </div>
        <div className="stat-pill">
          <span className="stat-label">Pairs / round</span>
          <span className="stat-value">5</span>
        </div>
      </section>

      <button type="button" className="primary-btn start-btn" onClick={onStart}>
        Start matching
      </button>
    </div>
  );
}
