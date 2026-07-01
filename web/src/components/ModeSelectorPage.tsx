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
