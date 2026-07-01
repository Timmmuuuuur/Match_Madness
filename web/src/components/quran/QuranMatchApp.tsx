import { useMemo, useState } from 'react';
import type { Direction, GameSettings, GameStats } from '@shared/types';
import {
  quranMatchModeLabel,
  resolveQuranMatchPool,
  type QuranMatchMode,
} from '@shared/quran';
import { saveBestScore, loadBestScore } from '../../lib/storage';
import { GameScreen } from '../GameScreen';
import { ResultsScreen } from '../ResultsScreen';

type Screen = 'home' | 'game' | 'results';

const MATCH_MODES: QuranMatchMode[] = [
  'letters-glyphs',
  'letters-names',
  'harakat',
  'letter-harakat',
  'vocab',
  'mixed',
];

function QuranHomeScreen({
  mode,
  direction,
  hideHints,
  onModeChange,
  onDirectionChange,
  onHideHintsChange,
  onStart,
}: {
  mode: QuranMatchMode;
  direction: Direction;
  hideHints: boolean;
  onModeChange: (m: QuranMatchMode) => void;
  onDirectionChange: (d: Direction) => void;
  onHideHintsChange: (v: boolean) => void;
  onStart: () => void;
}) {
  const pool = resolveQuranMatchPool(mode, hideHints);
  const best = loadBestScore(`quran-${mode}-${direction}${hideHints ? '-hard' : ''}`);

  return (
    <div className="screen home-screen quran-home">
      <header className="hero">
        <div className="logo-badge quran-badge">قرآن</div>
        <h1>Quran Reading — Match</h1>
        <p className="subtitle">Letters, harakat, vocabulary — no timer, think before you tap</p>
      </header>

      <section className="card">
        <h2>Match mode</h2>
        <div className="option-grid pool-grid">
          {MATCH_MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`option-btn${mode === m ? ' active' : ''}`}
              onClick={() => onModeChange(m)}
            >
              <strong>{quranMatchModeLabel(m)}</strong>
              <span>{resolveQuranMatchPool(m, false).length} pairs in pool</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Difficulty</h2>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn${!hideHints ? ' active' : ''}`}
            onClick={() => onHideHintsChange(false)}
          >
            With transliteration hints
          </button>
          <button
            type="button"
            className={`toggle-btn${hideHints ? ' active' : ''}`}
            onClick={() => onHideHintsChange(true)}
          >
            Hard — no hints
          </button>
        </div>
        <p className="hint">Hard mode hides transliteration on tiles. Mixed mode combines letters + harakat + short vocab.</p>
      </section>

      <section className="card">
        <h2>Direction</h2>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${direction === 'en-ar' ? 'active' : ''}`}
            onClick={() => onDirectionChange('en-ar')}
          >
            English → Arabic
          </button>
          <button
            type="button"
            className={`toggle-btn ${direction === 'ar-en' ? 'active' : ''}`}
            onClick={() => onDirectionChange('ar-en')}
          >
            Arabic → English
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Pool</h2>
        <p className="hint" style={{ margin: 0 }}>
          {pool.length} items · 7 on board · untimed · goal 25 matches
        </p>
      </section>

      {best > 0 && <p className="best-score">Best score: {best} pts</p>}

      <button type="button" className="primary-btn start-btn" onClick={onStart}>
        Start matching
      </button>
    </div>
  );
}

export function QuranMatchApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [matchMode, setMatchMode] = useState<QuranMatchMode>('letters-glyphs');
  const [direction, setDirection] = useState<Direction>('en-ar');
  const [hideHints, setHideHints] = useState(false);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [gameSession, setGameSession] = useState(0);

  const words = useMemo(
    () => resolveQuranMatchPool(matchMode, hideHints),
    [matchMode, hideHints],
  );

  const settings: GameSettings = useMemo(
    () => ({
      poolId: '500',
      direction,
      pairsPerRound: 7,
      totalRounds: 5,
      timed: false,
      hideHints,
      matchGoal: 25,
    }),
    [direction, hideHints],
  );

  const handleStart = () => {
    setGameSession((n) => n + 1);
    setScreen('game');
    setStats(null);
    setIsNewBest(false);
  };

  const handleComplete = (result: GameStats) => {
    const key = `quran-${matchMode}-${result.direction}${hideHints ? '-hard' : ''}`;
    const newBest = saveBestScore(key, result.score);
    setIsNewBest(newBest);
    setStats(result);
    setScreen('results');
  };

  const gameKey = `${gameSession}-${matchMode}-${direction}-${hideHints}`;

  return (
    <>
      {screen === 'home' && (
        <QuranHomeScreen
          mode={matchMode}
          direction={direction}
          hideHints={hideHints}
          onModeChange={setMatchMode}
          onDirectionChange={setDirection}
          onHideHintsChange={setHideHints}
          onStart={handleStart}
        />
      )}

      {screen === 'game' && (
        <GameScreen
          key={gameKey}
          words={words}
          settings={settings}
          onComplete={handleComplete}
          onQuit={() => setScreen('home')}
        />
      )}

      {screen === 'results' && stats && (
        <ResultsScreen stats={stats} isNewBest={isNewBest} onPlayAgain={handleStart} onHome={() => setScreen('home')} />
      )}
    </>
  );
}
