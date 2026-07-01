import { useState, type ReactNode } from 'react';
import type { Direction, GameSettings, GameStats, WordPoolId } from '@shared/types';
import { usePathname } from './lib/router';
import { frenchSubPath, isHomePath, quranSubPath } from './lib/tracks';
import { useWordPool } from './hooks/useWordPool';
import { saveBestScore } from './lib/storage';
import { AppNav } from './components/AppNav';
import { ModeSelectorPage } from './components/ModeSelectorPage';
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
import { QuranMatchApp } from './components/quran/QuranMatchApp';
import { LettersPage } from './components/quran/LettersPage';
import { HarakatPage } from './components/quran/HarakatPage';
import { QuranVocabPage } from './components/quran/QuranVocabPage';
import { QuranReadingPage } from './components/quran/QuranReadingPage';
import { QuranSpeakingPage } from './components/quran/QuranSpeakingPage';
import { WordPracticePage } from './components/quran/WordPracticePage';
import { TajweedPage } from './components/quran/TajweedPage';
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

function renderFrenchPage(sub: string): ReactNode {
  if (sub === '/vocab' || sub.startsWith('/vocab/')) return <VocabPage />;
  if (sub === '/reading' || sub.startsWith('/reading/')) return <ReadingPage />;
  if (sub === '/breaking-bad' || sub.startsWith('/breaking-bad/')) return <BreakingBadPage />;
  if (sub === '/tef-tcf' || sub.startsWith('/tef-tcf/')) return <TefTcfPage />;
  if (sub === '/speaking' || sub.startsWith('/speaking/')) return <SpeakingPage />;
  if (sub === '/topics' || sub.startsWith('/topics/')) return <TopicsPage />;
  if (sub === '/pronunciation' || sub.startsWith('/pronunciation/')) return <PronunciationPage />;
  if (sub === '/grammar' || sub.startsWith('/grammar/')) return <GrammarPage />;
  return <MatchApp />;
}

function renderQuranPage(sub: string): ReactNode {
  if (sub === '/letters' || sub.startsWith('/letters/')) return <LettersPage />;
  if (sub === '/harakat' || sub.startsWith('/harakat/')) return <HarakatPage />;
  if (sub === '/vocab' || sub.startsWith('/vocab/')) return <QuranVocabPage />;
  if (sub === '/reading' || sub.startsWith('/reading/')) return <QuranReadingPage />;
  if (sub === '/speaking' || sub.startsWith('/speaking/')) return <QuranSpeakingPage />;
  if (sub === '/practice' || sub.startsWith('/practice/')) return <WordPracticePage />;
  if (sub === '/tajweed' || sub.startsWith('/tajweed/')) return <TajweedPage />;
  return <QuranMatchApp />;
}

function App() {
  const path = usePathname();

  let page: ReactNode;
  if (isHomePath(path)) {
    page = <ModeSelectorPage />;
  } else if (path === '/quran' || path.startsWith('/quran/')) {
    page = renderQuranPage(quranSubPath(path));
  } else {
    page = renderFrenchPage(frenchSubPath(path));
  }

  return (
    <div className={`app-shell${path.startsWith('/quran') ? ' app-shell--quran' : ''}`}>
      <AppNav />
      {page}
    </div>
  );
}

export default App;
