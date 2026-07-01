import { usePathname } from '../lib/router';
import { appPath } from '../lib/base';
import { frenchSubPath, getTrackFromPath, isHomePath, quranSubPath } from '../lib/tracks';

const FRENCH_LINKS = [
  { href: '/french', label: 'Match' },
  { href: '/topics', label: 'Topics' },
  { href: '/vocab', label: 'Vocab' },
  { href: '/reading', label: 'Reading' },
  { href: '/breaking-bad', label: 'Breaking Bad' },
  { href: '/speaking', label: 'Speaking' },
  { href: '/tef-tcf', label: 'TEF/TCF' },
  { href: '/pronunciation', label: 'Sounds' },
  { href: '/grammar', label: 'Grammar' },
] as const;

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

function isFrenchActive(path: string, href: string): boolean {
  const sub = frenchSubPath(path);
  if (href === '/french') return sub === '/' || sub === '';
  const legacy = href;
  return sub === legacy || sub.startsWith(`${legacy}/`);
}

function isQuranActive(path: string, href: string): boolean {
  const sub = quranSubPath(path);
  if (href === '/quran') return sub === '/' || sub === '';
  const suffix = href.slice('/quran'.length);
  return sub === suffix || sub.startsWith(`${suffix}/`);
}

export function AppNav() {
  const path = usePathname();
  const track = getTrackFromPath(path);

  if (isHomePath(path)) return null;

  const links = track === 'quran' ? QURAN_LINKS : FRENCH_LINKS;
  const isActive = track === 'quran' ? isQuranActive : isFrenchActive;
  const trackLabel = track === 'quran' ? '📖 Quran reading' : '🇫🇷 French';

  return (
    <>
      <div className="track-bar">
        <a href={appPath('/')} className="track-bar-switch">← All tracks</a>
        <span className="track-bar-label">{trackLabel}</span>
      </div>
      <nav className="app-nav" aria-label="Main">
        {links.map(({ href, label }) => (
          <a
            key={href}
            href={appPath(href)}
            className={`nav-link${isActive(path, href) ? ' active' : ''}`}
          >
            {label}
          </a>
        ))}
      </nav>
    </>
  );
}
