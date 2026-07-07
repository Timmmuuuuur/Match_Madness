import { appPath } from '../lib/base';

const TRACKS = [
  {
    id: 'french',
    href: '/french',
    emoji: '🇫🇷',
    title: 'French',
    subtitle: 'Match game, topics, vocab, reading, speaking, TEF/TCF, grammar & pronunciation.',
    accent: 'track-french',
  },
  {
    id: 'kazakh',
    href: '/kazakh',
    emoji: '🇰🇿',
    title: 'Kazakh',
    subtitle: 'Match game, topics, vocab, reading, speaking, grammar & pronunciation — Cyrillic Kazakh.',
    accent: 'track-kazakh',
  },
  {
    id: 'russian',
    href: '/russian',
    emoji: '🇷🇺',
    title: 'Russian',
    subtitle: 'Match game, topics, vocab, reading, speaking, grammar & pronunciation — Cyrillic Russian.',
    accent: 'track-russian',
  },
  {
    id: 'korean',
    href: '/korean',
    emoji: '🇰🇷',
    title: 'Korean',
    subtitle: 'Match game, topics, vocab, reading, speaking, grammar & pronunciation — Hangul Korean.',
    accent: 'track-korean',
  },
  {
    id: 'quran',
    href: '/quran',
    emoji: '📖',
    title: 'Arabic — Quran reading',
    subtitle: 'Letters, harakat, Quranic vocabulary, reading practice, tajweed & match game.',
    accent: 'track-quran',
  },
] as const;

export function ModeSelectorPage() {
  return (
    <div className="screen mode-selector-screen">
      <header className="hero mode-hero">
        <div className="logo-badge">MM</div>
        <h1>Match Madness</h1>
        <p className="subtitle">Choose your learning track</p>
      </header>

      <div className="track-grid">
        {TRACKS.map((track) => (
          <a key={track.id} href={appPath(track.href)} className={`track-card card ${track.accent}`}>
            <span className="track-card-emoji" aria-hidden>{track.emoji}</span>
            <h2>{track.title}</h2>
            <p>{track.subtitle}</p>
            <span className="track-card-cta">Open track →</span>
          </a>
        ))}
      </div>
    </div>
  );
}
