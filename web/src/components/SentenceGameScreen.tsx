import { useEffect, useRef, useState } from 'react';
import type { Direction, GameStats } from '@shared/types';
import sentences from '@shared/data/sentences.json';
import { calcMatchScore, shuffle } from '../lib/gameEngine';
import { ProgressBar } from './ProgressBar';
import { GameToast } from './GameToast';
import { useGameLayoutLock } from '../hooks/useGameLayoutLock';
import {
  maybeCelebrateHaptic,
  pickEncouragement,
  playCorrectSound,
  playWrongSound,
  primeGameAudio,
} from '../lib/gameFeedback';

const PAIRS_ON_BOARD = 5;
const CORRECT_HOLD_MS = 420;
const WRONG_FLASH_MS = 180;

interface Sentence { id: number; french: string; english: string; }

interface SentenceTile {
  id: string;
  pairId: number;
  text: string;
  language: 'french' | 'english';
  side: 'left' | 'right';
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function pickNext<T extends { id: number }>(all: T[], used: Set<number>, onBoard: Set<number>): T {
  const available = all.filter((s) => !used.has(s.id) && !onBoard.has(s.id));
  const source = available.length > 0 ? available : all.filter((s) => !onBoard.has(s.id));
  const fallback = source.length > 0 ? source : all;
  return pickRandom(fallback, 1)[0];
}

function buildColumns(pairs: Sentence[], direction: Direction) {
  const frTiles: SentenceTile[] = shuffle(
    pairs.map((p) => ({ id: `${p.id}-fr`, pairId: p.id, text: p.french, language: 'french' as const, side: 'right' as const })),
  );
  const enTiles: SentenceTile[] = shuffle(
    pairs.map((p) => ({ id: `${p.id}-en`, pairId: p.id, text: p.english, language: 'english' as const, side: 'left' as const })),
  );
  const left = direction === 'en-fr' ? enTiles : frTiles;
  const right = direction === 'en-fr' ? frTiles : enTiles;
  left.forEach((t) => { t.side = 'left'; });
  right.forEach((t) => { t.side = 'right'; });
  const tileMap = new Map<string, SentenceTile>([...left, ...right].map((t) => [t.id, t]));
  return { leftTiles: left, rightTiles: right, tileMap };
}

function replaceSentencePair(
  pairId: number,
  newPair: Sentence,
  leftTiles: SentenceTile[],
  rightTiles: SentenceTile[],
  direction: Direction,
) {
  const isEnFr = direction === 'en-fr';
  const newLeft: SentenceTile = {
    id: `${newPair.id}-${isEnFr ? 'en' : 'fr'}`,
    pairId: newPair.id,
    text: isEnFr ? newPair.english : newPair.french,
    language: isEnFr ? 'english' : 'french',
    side: 'left',
  };
  const newRight: SentenceTile = {
    id: `${newPair.id}-${isEnFr ? 'fr' : 'en'}`,
    pairId: newPair.id,
    text: isEnFr ? newPair.french : newPair.english,
    language: isEnFr ? 'french' : 'english',
    side: 'right',
  };
  const newLeftTiles = leftTiles.map((t) => (t.pairId === pairId ? newLeft : t));
  const newRightTiles = rightTiles.map((t) => (t.pairId === pairId ? newRight : t));
  const tileMap = new Map<string, SentenceTile>([...newLeftTiles, ...newRightTiles].map((t) => [t.id, t]));
  return { leftTiles: newLeftTiles, rightTiles: newRightTiles, tileMap };
}

interface Props {
  direction: Direction;
  onComplete: (stats: GameStats) => void;
  onQuit: () => void;
}

function SentenceTileButton({
  tile,
  selected,
  correct,
  wrong,
  onSelect,
}: {
  tile: SentenceTile;
  selected: boolean;
  correct: boolean;
  wrong: boolean;
  onSelect: (id: string) => void;
}) {
  const lastTapRef = useRef(0);
  const cls = ['tile', 'tile-sentence', selected && 'selected', correct && 'correct', wrong && 'wrong'].filter(Boolean).join(' ');

  const activate = () => {
    if (correct || wrong) return;
    const now = Date.now();
    if (now - lastTapRef.current < 150) return;
    lastTapRef.current = now;
    onSelect(tile.id);
  };

  return (
    <button
      type="button"
      className={cls}
      disabled={correct}
      onPointerDown={(e) => {
        void primeGameAudio();
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        activate();
      }}
    >
      <span className="tile-text">{tile.text}</span>
    </button>
  );
}

export function SentenceGameScreen({ direction, onComplete }: Props) {
  useGameLayoutLock();

  const all = sentences.sentences as Sentence[];

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [usedIds, setUsedIds] = useState<Set<number>>(() => new Set());
  const [leftTiles, setLeftTiles] = useState<SentenceTile[]>([]);
  const [rightTiles, setRightTiles] = useState<SentenceTile[]>([]);
  const [tileMap, setTileMap] = useState<Map<string, SentenceTile>>(new Map());
  const [selected, setSelected] = useState<SentenceTile | null>(null);
  const [correctIds, setCorrectIds] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const selectedRef = useRef<SentenceTile | null>(null);
  const streakRef = useRef(0);
  const correctRef = useRef(0);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const correctIdsRef = useRef<Set<string>>(new Set());
  const boardRef = useRef({ leftTiles, rightTiles, usedIds, tileMap });

  useEffect(() => {
    boardRef.current = { leftTiles, rightTiles, usedIds, tileMap };
  }, [leftTiles, rightTiles, usedIds, tileMap]);

  useEffect(() => {
    streakRef.current = streak;
  }, [streak]);

  useEffect(() => {
    correctRef.current = correct;
  }, [correct]);

  useEffect(() => {
    const pairs = pickRandom(all, PAIRS_ON_BOARD);
    const layout = buildColumns(pairs, direction);
    setLeftTiles(layout.leftTiles);
    setRightTiles(layout.rightTiles);
    setTileMap(layout.tileMap);
    setUsedIds(new Set());
    selectedRef.current = null;
    correctIdsRef.current = new Set();
    setSelected(null);
    setCorrectIds(new Set());
    return () => { if (flashTimerRef.current) clearTimeout(flashTimerRef.current); };
  }, [all, direction]);

  const handleQuit = () => {
    onComplete({ score, correctMatches: correct, wrongMatches: wrong, roundsCompleted: correct, poolId: '500', direction });
  };

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

    selectedRef.current = null;
    setSelected(null);

    if (cur.pairId === tile.pairId) {
      const matchedPairId = cur.pairId;
      const flashIds = [cur.id, tile.id];
      const nextCorrect = new Set([...correctIdsRef.current, ...flashIds]);
      correctIdsRef.current = nextCorrect;
      setCorrectIds(nextCorrect);

      playCorrectSound().catch(() => {});
      const nextStreak = streakRef.current + 1;
      const nextCorrectCount = correctRef.current + 1;
      maybeCelebrateHaptic(nextCorrectCount);
      const encouragement = pickEncouragement(nextStreak, nextCorrectCount);
      if (encouragement) setToast(encouragement);

      setScore((s) => s + calcMatchScore(streakRef.current));
      setStreak((s) => {
        const next = s + 1;
        streakRef.current = next;
        return next;
      });
      setCorrect((c) => c + 1);

      window.setTimeout(() => {
        const { leftTiles: left, rightTiles: right, usedIds: used } = boardRef.current;
        const nextUsed = new Set(used);
        nextUsed.add(matchedPairId);
        const onBoard = new Set([...left, ...right].map((t) => t.pairId));
        onBoard.delete(matchedPairId);
        const newPair = pickNext(all, nextUsed, onBoard);
        nextUsed.add(newPair.id);

        const updated = replaceSentencePair(matchedPairId, newPair, left, right, direction);
        boardRef.current = {
          leftTiles: updated.leftTiles,
          rightTiles: updated.rightTiles,
          usedIds: nextUsed,
          tileMap: updated.tileMap,
        };
        setLeftTiles(updated.leftTiles);
        setRightTiles(updated.rightTiles);
        setTileMap(updated.tileMap);
        setUsedIds(nextUsed);

        flashIds.forEach((id) => correctIdsRef.current.delete(id));
        setCorrectIds(new Set(correctIdsRef.current));
      }, CORRECT_HOLD_MS);
    } else {
      playWrongSound().catch(() => {});
      setWrong((w) => w + 1);
      setStreak(0);
      streakRef.current = 0;
      setWrongIds(new Set([cur.id, tile.id]));
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = window.setTimeout(() => setWrongIds(new Set()), WRONG_FLASH_MS);
    }
  };

  const leftLabel = direction === 'en-fr' ? 'English' : 'French';
  const rightLabel = direction === 'en-fr' ? 'French' : 'English';

  return (
    <div className="screen game-screen">
      <header className="game-header">
        <button type="button" className="ghost-btn" onClick={handleQuit}>✕</button>
        <div className="game-meta">
          <span className="round-tag">{correct} matched</span>
          <span className="direction-tag">{direction === 'en-fr' ? 'EN → FR' : 'FR → EN'}</span>
        </div>
        <div className="score-display">{score} pts</div>
      </header>

      <ProgressBar current={Math.min(correct, 20)} total={20} label="Session progress" />

      <div className="game-status game-status--sentence">
        <span className="mode-badge">Sentences</span>
        <span className={`streak-badge${streak >= 2 ? ' streak-badge--on' : ''}`} aria-hidden={streak < 2}>
          {streak >= 2 ? `${streak} streak` : '0 streak'}
        </span>
      </div>

      <div className="match-board sentence-board" onPointerDown={() => { void primeGameAudio(); }}>
        <div className="match-column">
          <h3 className="column-label">{leftLabel}</h3>
          <div className="tile-column">
            {leftTiles.map((tile, index) => (
              <SentenceTileButton
                key={`left-${index}`}
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
          <h3 className="column-label">{rightLabel}</h3>
          <div className="tile-column">
            {rightTiles.map((tile, index) => (
              <SentenceTileButton
                key={`right-${index}`}
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

      <GameToast message={toast} />

      <p className="game-hint">Tap ✕ when finished to see your results.</p>
    </div>
  );
}
