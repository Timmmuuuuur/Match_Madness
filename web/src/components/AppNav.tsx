import { usePathname } from '../lib/router';
import { appPath } from '../lib/base';

const LINKS = [
  { href: '/', label: 'Match' },
  { href: '/topics', label: 'Topics' },
  { href: '/vocab', label: 'Vocab' },
  { href: '/reading', label: 'Reading' },
  { href: '/speaking', label: 'Speaking' },
  { href: '/tef-tcf', label: 'TEF/TCF' },
  { href: '/pronunciation', label: 'Sounds' },
  { href: '/grammar', label: 'Grammar' },
] as const;

function isActive(path: string, href: string): boolean {
  if (href === '/') return path === '/' || path === '';
  return path === href || path.startsWith(`${href}/`);
}

export function AppNav() {
  const path = usePathname();

  return (
    <nav className="app-nav" aria-label="Main">
      {LINKS.map(({ href, label }) => (
        <a
          key={href}
          href={appPath(href)}
          className={`nav-link${isActive(path, href) ? ' active' : ''}`}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
