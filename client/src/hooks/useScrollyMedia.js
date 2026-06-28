import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/api.js';

export function useScrollyMedia(theme) {
  const [mediaMap, setMediaMap] = useState({});
  const [version, setVersion] = useState(0);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const fetchMedia = useCallback(() => {
    const currentTheme = themeRef.current;
    if (!currentTheme) return;
    // Use cache-busting query param so browser never serves a stale response
    fetch(`${API_BASE_URL}/themes?_=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        const list = json?.data ?? [];
        const match = list.find((t) => t.id === currentTheme || t.key === currentTheme);
        const incoming = match?.scrollyMedia || {};
        setMediaMap((prev) => {
          // Only trigger a re-render if something actually changed
          if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev;
          setVersion((v) => v + 1);
          return incoming;
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!theme) return;
    fetchMedia();
    window.addEventListener('focus', fetchMedia);
    // Poll every 10 s (was 30 s) so changes appear faster
    const interval = setInterval(fetchMedia, 10_000);
    return () => {
      window.removeEventListener('focus', fetchMedia);
      clearInterval(interval);
    };
  }, [theme, fetchMedia]);

  /**
   * Resolve a slot id to the URL that should be used in <img> / <video>.
   *
   * Key fix: the cache-bust token is derived from `version` (a state counter),
   * NOT from Date.now() called inline.  Calling Date.now() inside a callback
   * that is memoised with useCallback means every render produces a brand-new
   * function reference, but the stale closure inside <video src={resolve(…)}>
   * still uses the old URL string — the browser never sees the new one unless
   * the component re-renders AND the returned URL string is different.
   *
   * Using `version` as the cache-bust value guarantees:
   *   1. The URL string changes exactly when we know the server has new data.
   *   2. resolve() is re-created (new reference) only when mediaMap changes,
   *      so consumers don't re-render unnecessarily.
   */
  const resolve = useCallback(
    (id, defaultSrc = null) => {
      const custom = mediaMap[id];
      if (!custom) return defaultSrc;
      const sep = custom.includes('?') ? '&' : '?';
      return `${custom}${sep}v=${version}`;
    },
    [mediaMap, version]
  );

  return { resolve, refetch: fetchMedia };
}
