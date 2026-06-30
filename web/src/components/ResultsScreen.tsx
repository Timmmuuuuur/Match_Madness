import type { GameStats } from '@shared/types';
import { accuracy } from '../lib/storage';

interface ResultsScreenProps {
  stats: GameStats;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultsScreen({ stats, isNewBest, onPlayAgain, onHome }: ResultsScreenProps) {
  const acc = accuracy(stats);

  return (
    <div className="screen results-screen">
      <div className="results-card win">
        <div className="results-icon">🎉</div>
        <h1>Nice work!</h1>
        {isNewBest && <p className="new-best">New best score!</p>}

        <div className="results-score">{stats.score}</div>
        <p className="results-sub">points</p>

        <div className="results-grid">
          <div className="result-stat">
            <span>Accuracy</span>
            <strong>{acc}%</strong>
          </div>
          <div className="result-stat">
            <span>Correct</span>
            <strong>{stats.correctMatches}</strong>
          </div>
          <div className="result-stat">
            <span>Misses</span>
            <strong>{stats.wrongMatches}</strong>
          </div>
          <div className="result-stat">
            <span>Rounds</span>
            <strong>{stats.roundsCompleted}</strong>
          </div>
        </div>

        <div className="results-actions">
          <button type="button" className="primary-btn" onClick={onPlayAgain}>
            Play again
          </button>
          <button type="button" className="secondary-btn" onClick={onHome}>
            Change settings
          </button>
        </div>
      </div>
    </div>
  );
}
