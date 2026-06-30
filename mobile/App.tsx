import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Direction, PoolSize } from '@shared/types';
import {
  MAX_LIVES,
  PAIRS_PER_ROUND,
  POOL_SIZES,
  TOTAL_ROUNDS,
  buildTiles,
  calcMatchScore,
  isMatch,
  layoutColumns,
  pickRandomPairs,
  type TileData,
} from './src/gameEngine';
import { getWordPool } from './src/wordPools';

type Screen = 'home' | 'game' | 'results';

const BEST_KEY = 'match-madness-best';

async function loadBest(poolSize: number) {
  try {
    const raw = await AsyncStorage.getItem(BEST_KEY);
    if (!raw) return 0;
    const map = JSON.parse(raw) as Record<string, number>;
    return map[String(poolSize)] ?? 0;
  } catch {
    return 0;
  }
}

async function saveBest(poolSize: number, score: number) {
  try {
    const raw = await AsyncStorage.getItem(BEST_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const current = map[String(poolSize)] ?? 0;
    if (score > current) {
      map[String(poolSize)] = score;
      await AsyncStorage.setItem(BEST_KEY, JSON.stringify(map));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [poolSize, setPoolSize] = useState<PoolSize>(500);
  const [direction, setDirection] = useState<Direction>('en-fr');
  const [best, setBest] = useState(0);

  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [selected, setSelected] = useState<TileData | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [locked, setLocked] = useState(false);
  const [usedPairIds, setUsedPairIds] = useState<Set<number>>(new Set());
  const [roundPairs, setRoundPairs] = useState(() => pickRandomPairs(getWordPool(500), PAIRS_PER_ROUND));
  const [leftTiles, setLeftTiles] = useState<TileData[]>([]);
  const [rightTiles, setRightTiles] = useState<TileData[]>([]);
  const [tileMap, setTileMap] = useState<Map<string, TileData>>(new Map());
  const [isNewBest, setIsNewBest] = useState(false);

  const words = useMemo(() => getWordPool(poolSize), [poolSize]);

  const setupRound = useCallback(
    (used: Set<number>) => {
      const available = words.filter((w) => !used.has(w.id));
      const source = available.length >= PAIRS_PER_ROUND ? available : words;
      const pairs = pickRandomPairs(source, PAIRS_PER_ROUND);
      setRoundPairs(pairs);
      const layout = layoutColumns(pairs, direction);
      setLeftTiles(layout.leftTiles);
      setRightTiles(layout.rightTiles);
      setTileMap(layout.tileMap);
      setMatchedIds(new Set());
      setWrongIds(new Set());
      setSelected(null);
      setLocked(false);
    },
    [words, direction],
  );

  const startGame = useCallback(() => {
    setScreen('game');
    setRound(1);
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setCorrect(0);
    setWrong(0);
    const used = new Set<number>();
    setUsedPairIds(used);
    setupRound(used);
  }, [setupRound]);

  const finishGame = useCallback(async () => {
    const newBest = await saveBest(poolSize, score);
    setIsNewBest(newBest);
    setScreen('results');
  }, [poolSize, score]);

  const nextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) {
      finishGame();
      return;
    }
    const nextUsed = new Set(usedPairIds);
    roundPairs.forEach((p) => nextUsed.add(p.id));
    setUsedPairIds(nextUsed);
    setRound((r) => r + 1);
    setupRound(nextUsed);
  }, [round, usedPairIds, roundPairs, finishGame, setupRound]);

  const tiles = useMemo(() => buildTiles(roundPairs), [roundPairs]);

  const handleSelect = (tileId: string) => {
    const tile = tileMap.get(tileId);
    if (!tile) return;
    if (locked || matchedIds.has(tile.id)) return;

    if (!selected) {
      setSelected(tile);
      return;
    }
    if (selected.id === tile.id) {
      setSelected(null);
      return;
    }

    // Same side — move selection highlight, never penalise
    if (selected.side === tile.side) {
      setSelected(tile);
      return;
    }

    setLocked(true);
    if (isMatch(selected, tile)) {
      const pts = calcMatchScore(streak);
      setScore((s) => s + pts);
      setStreak((s) => s + 1);
      setCorrect((c) => c + 1);
      const nextMatched = new Set(matchedIds);
      nextMatched.add(selected.id);
      nextMatched.add(tile.id);
      setMatchedIds(nextMatched);
      setTimeout(() => {
        setSelected(null);
        setLocked(false);
        if (nextMatched.size >= roundPairs.length * 2) setTimeout(nextRound, 400);
      }, 450);
      return;
    }

    setStreak(0);
    setWrong((w) => w + 1);
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) setTimeout(() => finishGame(), 650);
      return next;
    });
    setWrongIds(new Set([selected.id, tile.id]));
    setTimeout(() => {
      setSelected(null);
      setWrongIds(new Set());
      setLocked(false);
    }, 600);
  };

  React.useEffect(() => {
    loadBest(poolSize).then(setBest);
  }, [poolSize, screen]);

  const poolLabel = (s: PoolSize) =>
    s === 500 ? '500 words' : `${s.toLocaleString()} words`;

  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.home}>
          <View style={styles.logo}><Text style={styles.logoText}>MM</Text></View>
          <Text style={styles.title}>Match Madness</Text>
          <Text style={styles.subtitle}>English ↔ French</Text>

          <Text style={styles.section}>Word pool</Text>
          <View style={styles.grid}>
            {POOL_SIZES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.option, poolSize === s && styles.optionActive]}
                onPress={() => setPoolSize(s)}
              >
                <Text style={styles.optionTitle}>{poolLabel(s)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.section}>Practice mode</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.toggle, direction === 'en-fr' && styles.toggleActive]}
              onPress={() => setDirection('en-fr')}
            >
              <Text style={styles.toggleText}>EN → FR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggle, direction === 'fr-en' && styles.toggleActive]}
              onPress={() => setDirection('fr-en')}
            >
              <Text style={styles.toggleText}>FR → EN</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.best}>Best score: {best}</Text>
          <TouchableOpacity style={styles.primary} onPress={startGame}>
            <Text style={styles.primaryText}>START MATCHING</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'results') {
    const acc = correct + wrong === 0 ? 100 : Math.round((correct / (correct + wrong)) * 100);
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.results}>
          <Text style={styles.resultsEmoji}>{wrong < 3 ? '🎉' : '💪'}</Text>
          <Text style={styles.title}>{wrong < 3 ? 'Great job!' : 'Keep practicing!'}</Text>
          {isNewBest && <Text style={styles.newBest}>New best score!</Text>}
          <Text style={styles.bigScore}>{score}</Text>
          <Text style={styles.subtitle}>Accuracy: {acc}% · Correct: {correct} · Misses: {wrong}</Text>
          <TouchableOpacity style={styles.primary} onPress={startGame}>
            <Text style={styles.primaryText}>PLAY AGAIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => setScreen('home')}>
            <Text style={styles.secondaryText}>Change settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const leftLabel = direction === 'en-fr' ? 'English' : 'French';
  const rightLabel = direction === 'en-fr' ? 'French' : 'English';

  const renderTile = (tile: TileData) => {
    const isSelected = selected?.id === tile.id;
    const isMatched = matchedIds.has(tile.id);
    const isWrong = wrongIds.has(tile.id);
    return (
      <TouchableOpacity
        key={tile.id}
        style={[
          styles.tile,
          tile.language === 'french' ? styles.tileFr : styles.tileEn,
          isSelected && styles.tileSelected,
          isWrong && styles.tileWrong,
          isMatched && styles.tileMatched,
        ]}
        disabled={locked || isMatched}
        onPress={() => handleSelect(tile.id)}
      >
        <Text style={styles.tileText}>{tile.text}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => setScreen('home')}><Text style={styles.quit}>✕</Text></TouchableOpacity>
        <Text style={styles.round}>Round {round}/{TOTAL_ROUNDS}</Text>
        <Text style={styles.score}>{score} pts</Text>
      </View>
      <Text style={styles.hearts}>{'♥'.repeat(lives)}{'♡'.repeat(MAX_LIVES - lives)}</Text>
      {streak >= 2 && <Text style={styles.streak}>🔥 {streak} streak</Text>}

      <View style={styles.board}>
        <View style={styles.column}>
          <Text style={styles.colLabel}>{leftLabel}</Text>
          {leftTiles.map(renderTile)}
        </View>
        <View style={styles.column}>
          <Text style={styles.colLabel}>{rightLabel}</Text>
          {rightTiles.map(renderTile)}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  home: { padding: 20, alignItems: 'center' },
  logo: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#58cc02',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  title: { fontSize: 28, fontWeight: '800', color: '#3c3c3c' },
  subtitle: { fontSize: 16, color: '#777', marginBottom: 20 },
  section: { alignSelf: 'flex-start', fontWeight: '700', color: '#777', marginTop: 12, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' },
  option: {
    width: '48%', padding: 14, borderRadius: 14, backgroundColor: '#fafafa',
    borderWidth: 2, borderColor: '#e5e5e5',
  },
  optionActive: { borderColor: '#58cc02', backgroundColor: '#d7ffb8' },
  optionTitle: { fontWeight: '700', fontSize: 15 },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  toggle: {
    flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#fafafa',
    borderWidth: 2, borderColor: '#e5e5e5', alignItems: 'center',
  },
  toggleActive: { borderColor: '#1cb0f6', backgroundColor: '#ddf4ff' },
  toggleText: { fontWeight: '700' },
  best: { marginVertical: 16, fontWeight: '700', color: '#46a302' },
  primary: {
    width: '100%', backgroundColor: '#58cc02', padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 8,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secondary: {
    width: '100%', padding: 14, borderRadius: 14, alignItems: 'center', marginTop: 10,
    borderWidth: 2, borderColor: '#e5e5e5', backgroundColor: '#fff',
  },
  secondaryText: { fontWeight: '700', color: '#3c3c3c' },
  gameHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16,
  },
  quit: { fontSize: 20, color: '#777' },
  round: { fontWeight: '700' },
  score: { fontWeight: '800', color: '#46a302', fontSize: 16 },
  hearts: { textAlign: 'center', fontSize: 22, color: '#ff4b4b', marginBottom: 8 },
  streak: { textAlign: 'center', fontWeight: '700', marginBottom: 8 },
  board: { flexDirection: 'row', paddingHorizontal: 12, gap: 10, flex: 1 },
  column: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 10, borderWidth: 2, borderColor: '#e5e5e5' },
  colLabel: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#777', marginBottom: 8 },
  tile: {
    minHeight: 48, padding: 10, borderRadius: 12, marginBottom: 8,
    borderWidth: 2, borderColor: '#e5e5e5', backgroundColor: '#fafafa', justifyContent: 'center',
  },
  tileFr: {},
  tileEn: {},
  tileSelected: { borderColor: '#1cb0f6', backgroundColor: '#ddf4ff' },
  tileWrong: { borderColor: '#ff4b4b', backgroundColor: '#ffe0e0' },
  tileMatched: { opacity: 0.35, backgroundColor: '#f0f0f0', borderColor: '#d8d8d8' },
  tileText: { fontWeight: '700', textAlign: 'center', fontSize: 14 },
  results: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  resultsEmoji: { fontSize: 48, marginBottom: 8 },
  newBest: { color: '#46a302', fontWeight: '800', marginBottom: 8 },
  bigScore: { fontSize: 56, fontWeight: '800', color: '#46a302' },
});
