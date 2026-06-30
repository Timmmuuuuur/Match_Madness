import { useCallback, useMemo, useState } from 'react';
import type { Direction, GameSettings, GameStats } from '@shared/types';
import { TOPICS, countTopicWords, resolveTopicWords, topicBestScoreKey } from '@shared/topics';
import { loadBestScore, saveBestScore } from '../lib/storage';
import { GameScreen } from './GameScreen';
import { ResultsScreen } from './ResultsScreen';

type Phase = 'pick' | 'game' | 'results';

const TOPIC_SETTINGS: GameSettings = {
  poolId: '500',
  direction: 'en-fr',
  pairsPerRound: 5,
  totalRounds: 5,
};

export function TopicsPage() {
  const [phase, setPhase] = useState<Phase>('pick');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState<Direction>('en-fr');
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [gameSession, setGameSession] = useState(0);

  const selectedIds = useMemo(() => [...selected], [selected]);
  const wordCount = useMemo(() => countTopicWords(selectedIds), [selectedIds]);
  const words = useMemo(() => resolveTopicWords(selectedIds), [selectedIds, gameSession]);

  const bestKey = selectedIds.length ? topicBestScoreKey(selectedIds) : '';
  const best = bestKey ? loadBestScore(bestKey) : 0;

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = () => setSelected(new Set(TOPICS.map((t) => t.id)));
  const clearAll = () => setSelected(new Set());

  const handleStart = () => {
    if (selected.size === 0 || wordCount < 5) return;
    setGameSession((n) => n + 1);
    setPhase('game');
    setStats(null);
    setIsNewBest(false);
  };

  const handleComplete = (result: GameStats) => {
    const key = topicBestScoreKey(selectedIds);
    const withTopics: GameStats = { ...result, topicIds: selectedIds };
    const newBest = saveBestScore(key, result.score);
    setIsNewBest(newBest);
    setStats(withTopics);
    setPhase('results');
  };

  if (phase === 'game' && words.length >= 5) {
    return (
      <GameScreen
        key={`${gameSession}-${bestKey}-${direction}`}
        words={words}
        settings={{ ...TOPIC_SETTINGS, direction }}
        onComplete={handleComplete}
        onQuit={() => setPhase('pick')}
      />
    );
  }

  if (phase === 'results' && stats) {
    return (
      <ResultsScreen
        stats={stats}
        isNewBest={isNewBest}
        onPlayAgain={handleStart}
        onHome={() => setPhase('pick')}
      />
    );
  }

  return (
    <div className="screen topics-screen">
      <header className="topics-hero">
        <h1>Topics</h1>
        <p className="subtitle">
          Pick one or many themes — words from every selected topic get mixed together for matching.
        </p>
      </header>

      <section className="card topics-toolbar">
        <div className="topics-toolbar-row">
          <div className="topics-selection-summary">
            <strong>{selected.size}</strong> topic{selected.size !== 1 ? 's' : ''} selected
            <span className="topics-word-count"> · {wordCount} words ready</span>
          </div>
          <div className="topics-toolbar-actions">
            <button type="button" className="text-btn" onClick={selectAll}>Select all</button>
            <button type="button" className="text-btn" onClick={clearAll}>Clear</button>
          </div>
        </div>

        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${direction === 'en-fr' ? 'active' : ''}`}
            onClick={() => setDirection('en-fr')}
          >
            English → French
          </button>
          <button
            type="button"
            className={`toggle-btn ${direction === 'fr-en' ? 'active' : ''}`}
            onClick={() => setDirection('fr-en')}
          >
            French → English
          </button>
        </div>

        <div className="stats-row topics-stats">
          <div className="stat-pill">
            <span className="stat-label">Best (this mix)</span>
            <span className="stat-value">{best}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Timer</span>
            <span className="stat-value">1:00</span>
          </div>
        </div>

        <button
          type="button"
          className="primary-btn start-btn"
          disabled={selected.size === 0 || wordCount < 5}
          onClick={handleStart}
        >
          {wordCount < 5 && selected.size > 0
            ? 'Need at least 5 words — pick more topics'
            : 'Start topic match'}
        </button>
      </section>

      <div className="topic-grid">
        {TOPICS.map((topic) => {
          const checked = selected.has(topic.id);
          return (
            <button
              key={topic.id}
              type="button"
              className={`topic-card topic-accent-${topic.accent}${checked ? ' selected' : ''}`}
              onClick={() => toggle(topic.id)}
              aria-pressed={checked}
            >
              <span className="topic-check" aria-hidden>{checked ? '✓' : ''}</span>
              <span className="topic-emoji">{topic.emoji}</span>
              <span className="topic-label">{topic.label}</span>
              <span className="topic-fr">{topic.frenchLabel}</span>
              <span className="topic-count">{topic.words.length} words</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
