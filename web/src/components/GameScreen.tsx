import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, GameSettings, GameStats, WordPair } from '@shared/types';
import {
  calcMatchScore,
  isMatch,
  layoutColumns,
  pickNextPair,
  pickRandomPairs,
  replacePairOnBoard,
  type TileData,
} from '../lib/gameEngine';
import { ProgressBar } from './ProgressBar';
import { Tile } from './Tile';
import { useGameLayoutLock } from '../hooks/useGameLayoutLock';

const GAME_DURATION_S = 60;
const CORRECT_HOLD_MS = 420;
const WRONG_FLASH_MS = 180;

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

interface GameScreenProps {
  words: WordPair[];
  settings: GameSettings;
  onComplete: (stats: GameStats) => void;
  onQuit: () => void;
}

export function GameScreen({ words, settings, onComplete, onQuit }: GameScreenProps) {
  useGameLayoutLock();

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);
  const [wrongMatches, setWrongMatches] = useState(0);
  const [selected, setSelected] = useState<TileData | null>(null);
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [usedPairIds, setUsedPairIds] = useState<Set<number>>(new Set());
  const [leftTiles, setLeftTiles] = useState<TileData[]>([]);
  const [rightTiles, setRightTiles] = useState<TileData[]>([]);
  const [tileMap, setTileMap] = useState<Map<string, TileData>>(new Map());
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedRef = useRef<TileData | null>(null);
  const streakRef = useRef(0);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swapTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const correctIdsRef = useRef<Set<string>>(new Set());
  const wordsRef = useRef(words);
  const boardRef = useRef({ leftTiles, rightTiles, usedPairIds, tileMap });

  wordsRef.current = words;

  const clearSwapTimers = useCallback(() => {
    swapTimersRef.current.forEach((t) => clearTimeout(t));
    swapTimersRef.current.clear();
  }, []);

  const scheduleSwap = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      swapTimersRef.current.delete(id);
      fn();
    }, delay);
    swapTimersRef.current.add(id);
  }, []);

  useEffect(() => {
    boardRef.current = { leftTiles, rightTiles, usedPairIds, tileMap };
  }, [leftTiles, rightTiles, usedPairIds, tileMap]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    clearSwapTimers();
    const pairs = pickRandomPairs(words, settings.pairsPerRound);
    const layout = layoutColumns(pairs, settings.direction);
    setLeftTiles(layout.leftTiles);
    setRightTiles(layout.rightTiles);
    setTileMap(layout.tileMap);
    setUsedPairIds(new Set());
    selectedRef.current = null;
    correctIdsRef.current = new Set();
    setSelected(null);
    setCorrectIds(new Set());
    setWrongIds(new Set());
    boardRef.current = {
      leftTiles: layout.leftTiles,
      rightTiles: layout.rightTiles,
      usedPairIds: new Set(),
      tileMap: layout.tileMap,
    };
    return clearSwapTimers;
  }, [words, settings.pairsPerRound, settings.direction, clearSwapTimers]);

  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onComplete({
      score,
      correctMatches,
      wrongMatches,
      roundsCompleted: correctMatches,
      poolId: settings.poolId,
      direction: settings.direction,
    });
  }, [score, correctMatches, wrongMatches, settings, onComplete]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      clearSwapTimers();
    };
  }, [clearSwapTimers]);

  useEffect(() => {
    if (timeLeft === 0) finishGame();
  }, [timeLeft, finishGame]);

  const handleSelect = (tileId: string) => {
    const tile = boardRef.current.tileMap.get(tileId);
    if (!tile) return;
    if (correctIdsRef.current.has(tile.id)) return;

    const cur = selectedRef.current;

    if (!cur) {
      selectedRef.current = tile;
      setSelected(tile);
      return;
    }
    if (cur.id === tile.id) {
      selectedRef.current = null;
      setSelected(null);
      return;
    }
    if (cur.side === tile.side) {
      selectedRef.current = tile;
      setSelected(tile);
      return;
    }

    // Commit match — clear selection immediately so next tap is fresh
    selectedRef.current = null;
    setSelected(null);

    if (isMatch(cur, tile)) {
      const matchedPairId = cur.pairId;
      const flashIds = [cur.id, tile.id];
      const nextCorrect = new Set([...correctIdsRef.current, ...flashIds]);
      correctIdsRef.current = nextCorrect;
      setCorrectIds(nextCorrect);

      setScore((s) => s + calcMatchScore(streakRef.current));
      setStreak((s) => {
        const next = s + 1;
        streakRef.current = next;
        return next;
      });
      setCorrectMatches((c) => c + 1);

      scheduleSwap(() => {
        const { leftTiles: left, rightTiles: right, usedPairIds: used } = boardRef.current;
        const nextUsed = new Set(used);
        nextUsed.add(matchedPairId);
        const newPair = pickNextPair(wordsRef.current, nextUsed);
        nextUsed.add(newPair.id);

        const updated = replacePairOnBoard(matchedPairId, newPair, left, right, settings.direction);
        boardRef.current = {
          leftTiles: updated.leftTiles,
          rightTiles: updated.rightTiles,
          usedPairIds: nextUsed,
          tileMap: updated.tileMap,
        };
        setLeftTiles(updated.leftTiles);
        setRightTiles(updated.rightTiles);
        setTileMap(updated.tileMap);
        setUsedPairIds(nextUsed);

        flashIds.forEach((id) => correctIdsRef.current.delete(id));
        setCorrectIds(new Set(correctIdsRef.current));
      }, CORRECT_HOLD_MS);
      return;
    }

    setStreak(0);
    streakRef.current = 0;
    setWrongMatches((w) => w + 1);
    setWrongIds(new Set([cur.id, tile.id]));
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = window.setTimeout(() => setWrongIds(new Set()), WRONG_FLASH_MS);
  };

  const dirLabel: Record<Direction, string> = { 'en-fr': 'EN → FR', 'fr-en': 'FR → EN' };
  const urgent = timeLeft <= 10;
  const timeProgress = 1 - timeLeft / GAME_DURATION_S;

  return (
    <div className="screen game-screen">
      <header className="game-header">
        <button type="button" className="ghost-btn" onClick={() => { if (timerRef.current) clearInterval(timerRef.current); onQuit(); }}>
          ✕
        </button>
        <div className="game-meta">
          <span className="round-tag">{correctMatches} matched</span>
          <span className="direction-tag">{dirLabel[settings.direction]}</span>
        </div>
        <div className={`timer${urgent ? ' timer-urgent' : ''}`}>{formatTime(timeLeft)}</div>
      </header>

      <ProgressBar current={timeProgress * 100} total={100} />

      <div className="game-status">
        <div className="score-display">{score} pts</div>
        <span className={`streak-badge${streak >= 2 ? ' streak-badge--on' : ''}`} aria-hidden={streak < 2}>
          {streak >= 2 ? `${streak} streak` : '0 streak'}
        </span>
      </div>

      <div className="match-board">
        <div className="match-column">
          <h3 className="column-label">{settings.direction === 'en-fr' ? 'English' : 'French'}</h3>
          <div className="tile-column">
            {leftTiles.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                selected={selected?.id === tile.id}
                correct={correctIds.has(tile.id)}
                wrong={wrongIds.has(tile.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
        <div className="match-column">
          <h3 className="column-label">{settings.direction === 'en-fr' ? 'French' : 'English'}</h3>
          <div className="tile-column">
            {rightTiles.map((tile) => (
              <Tile
                key={tile.id}
                tile={tile}
                selected={selected?.id === tile.id}
                correct={correctIds.has(tile.id)}
                wrong={wrongIds.has(tile.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
