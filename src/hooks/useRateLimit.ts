/**
 * @file useRateLimit.ts
 * @description Client-seitiger Rate Limiter (echtes Limiting: server-seitig).
 * Erlaubt max. 5 Anfragen pro 60 Sekunden pro Browser-Session.
 */
import { useState, useCallback } from 'react';

const MAX = 5;
const WINDOW = 60_000;
const KEY = 'lawcheck_requests';

export function useRateLimit() {
  const [isLimited, setIsLimited] = useState(false);

  const check = useCallback((): boolean => {
    const now = Date.now();
    const stored: number[] = JSON.parse(sessionStorage.getItem(KEY) || '[]');
    const recent = stored.filter(ts => now - ts < WINDOW);
    if (recent.length >= MAX) {
      setIsLimited(true);
      return false;
    }
    sessionStorage.setItem(KEY, JSON.stringify([...recent, now]));
    setIsLimited(false);
    return true;
  }, []);

  return { check, isLimited };
}
