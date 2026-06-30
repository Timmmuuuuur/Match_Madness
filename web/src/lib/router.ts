import { useCallback, useEffect, useState } from 'react';
import { appPath, stripBase } from './base';

export function usePathname(): string {
  const [path, setPath] = useState(() => stripBase(window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(stripBase(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return path;
}

export function navigate(path: string) {
  const target = appPath(path);
  window.history.pushState(null, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function useNavigate() {
  return useCallback((path: string) => navigate(path), []);
}
