import { usePathname } from '../lib/router';
import { appPath } from '../lib/base';
import {
  frenchSubPath,
  getTrackConfigForPath,
  getTrackFromPath,
  isHomePath,
  kazakhSubPath,
  koreanSubPath,
  quranSubPath,
  russianSubPath,
  trackPath,
} from '../lib/tracks';
import type { LearningTrack } from '@shared/types';

function subPathForLanguage(path: string, track: LearningTrack): string {
  if (track === 'kazakh') return kazakhSubPath(path);
  if (track === 'russian') return russianSubPath(path);
  if (track === 'korean') return koreanSubPath(path);
  return frenchSubPath(path);
}

function isLanguageActive(path: string, track: LearningTrack, subHref: string): boolean {
  const sub = subPathForLanguage(path, track);
  const normalized = subHref || '/';
  if (normalized === '/') return sub === '/' || sub === '';
  return sub === normalized || sub.startsWith(`${normalized}/`);
}

function isQuranActive(path: string, href: string): boolean {
  const sub = quranSubPath(path);
  if (href === '/quran') return sub === '/' || sub === '';
  const suffix = href.slice('/quran'.length);
  return sub === suffix || sub.startsWith(`${suffix}/`);
}

export function AppNav() {
  const path = usePathname();
  const trackId = getTrackFromPath(path);

  if (isHomePath(path)) return null;

  if (trackId === 'quran') {
    const QURAN_LINKS = [
      { href: '/quran', label: 'Match' },
      { href: '/quran/letters', label: 'Letters' },
      { href: '/quran/harakat', label: 'Harakat' },
      { href: '/quran/practice', label: 'Word drills' },
      { href: '/quran/vocab', label: 'Vocab' },
      { href: '/quran/speaking', label: 'Sentences' },
      { href: '/quran/reading', label: 'Reading' },
      { href: '/quran/tajweed', label: 'Tajweed' },
    ] as const;

    return (
      <>
        <div className="track-bar">
          <a href={appPath('/')} className="track-bar-switch">← All tracks</a>
          <span className="track-bar-label">📖 Quran reading</span>
        </div>
        <nav className="app-nav" aria-label="Main">
          {QURAN_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={appPath(href)}
              className={`nav-link${isQuranActive(path, href) ? ' active' : ''}`}
            >
              {label}
            </a>
          ))}
        </nav>
      </>
    );
  }

  const track = getTrackConfigForPath(path);

  return (
    <>
      <div className="track-bar">
        <a href={appPath('/')} className="track-bar-switch">← All tracks</a>
        <span className="track-bar-label">{track.flag} {track.label}</span>
      </div>
      <nav className="app-nav" aria-label="Main">
        {track.navLinks.map(({ href, label }) => (
          <a
            key={href || 'match'}
            href={appPath(trackPath(track.id, href))}
            className={`nav-link${isLanguageActive(path, track.id, href || '/') ? ' active' : ''}`}
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}
