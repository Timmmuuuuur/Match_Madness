/** Vite `base` — `/` locally, `/RepoName/` on GitHub Pages. */
export const BASE = import.meta.env.BASE_URL;

/** App route path for links and routing (always starts with `/`). */
export function appPath(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (clean === '/') return BASE.endsWith('/') ? BASE.slice(0, -1) || '/' : BASE;
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  if (prefix === '' || prefix === '/') return clean;
  return `${prefix}${clean}`;
}

/** Strip deploy base from `location.pathname` for route matching. */
export function stripBase(pathname: string): string {
  const prefix = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  if (prefix && prefix !== '/' && pathname.startsWith(prefix)) {
    const rest = pathname.slice(prefix.length);
    return rest === '' ? '/' : rest;
  }
  return pathname;
}
