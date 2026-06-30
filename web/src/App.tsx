import { useState, type ReactNode } from 'react';
import type { Direction, GameSettings, GameStats, WordPoolId } from '@shared/types';
import { usePathname } from './lib/router';
import { useWordPool } from './hooks/useWordPool';
import { saveBestScore } from './lib/storage';
import { AppNav } from './components/AppNav';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { SentenceGameScreen } from './components/SentenceGameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { VocabPage } from './components/VocabPage';
import { SpeakingPage } from './components/SpeakingPage';
import { TopicsPage } from './components/TopicsPage';
import { PronunciationPage } from './components/PronunciationPage';
import { GrammarPage } from './components/GrammarPage';
import { ReadingPage } from './components/ReadingPage';
import { BreakingBadPage } from './components/BreakingBadPage';
import { TefTcfPage } from './components/TefTcfPage';
import './App.css';

type Screen = 'home' | 'game' | 'results';
type GameMode = 'words' | 'sentences';

const DEFAULT_SETTINGS: GameSettings = {
  poolId: '500',
  direction: 'en-fr',
  pairsPerRound: 5,
  totalRounds: 5,
};

function MatchApp() {
  const [screen, setScreen] = useState<Screen>('home');
  const [mode, setMode] = useState<GameMode>('words');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [gameSession, setGameSession] = useState(0);

  const words = useWordPool(settings.poolId);

  const handleStart = () => {
    setGameSession((n) => n + 1);
    setScreen('game');
    setStats(null);
    setIsNewBest(false);
  };

  const handleComplete = (result: GameStats) => {
    const key = mode === 'sentences' ? `sent-${result.direction}` : result.poolId;
    const newBest = saveBestScore(key, result.score);
    setIsNewBest(newBest);
    setStats(result);
    setScreen('results');
  };

  const gameKey = `${gameSession}-${settings.poolId}-${settings.direction}`;

  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          poolId={settings.poolId}
          direction={settings.direction}
          mode={mode}
          onPoolIdChange={(poolId: WordPoolId) => setSettings((s) => ({ ...s, poolId }))}
          onDirectionChange={(direction: Direction) => setSettings((s) => ({ ...s, direction }))}
          onModeChange={setMode}
          onStart={handleStart}
        />
      )}

      {screen === 'game' && mode === 'words' && (
        <GameScreen
          key={gameKey}
          words={words}
          settings={settings}
          onComplete={handleComplete}
          onQuit={() => setScreen('home')}
        />
      )}

      {screen === 'game' && mode === 'sentences' && (
        <SentenceGameScreen
          key={gameKey}
          direction={settings.direction}
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

function App() {
  const path = usePathname();

  let page: ReactNode;
  if (path === '/vocab' || path.startsWith('/vocab/')) {
    page = <VocabPage />;
  } else if (path === '/reading' || path.startsWith('/reading/')) {
    page = <ReadingPage />;
  } else if (path === '/breaking-bad' || path.startsWith('/breaking-bad/')) {
    page = <BreakingBadPage />;
  } else if (path === '/tef-tcf' || path.startsWith('/tef-tcf/')) {
    page = <TefTcfPage />;
  } else if (path === '/speaking' || path.startsWith('/speaking/')) {
    page = <SpeakingPage />;
  } else if (path === '/topics' || path.startsWith('/topics/')) {
    page = <TopicsPage />;
  } else if (path === '/pronunciation' || path.startsWith('/pronunciation/')) {
    page = <PronunciationPage />;
  } else if (path === '/grammar' || path.startsWith('/grammar/')) {
    page = <GrammarPage />;
  } else {
    page = <MatchApp />;
  }

  return (
    <div className="app-shell">
      <AppNav />
      {page}
    </div>
  );
}

export default App;
