import { useCallback, useEffect, useState } from "react";

const KEY = "lg_recently_viewed";
const EVENT = "lg-recently-viewed-change";
const MAX = 12;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Lista de últimos productos vistos (últimos MAX, dedup, LRU al frente).
 * Si se pasa `trackId`, lo registra al montar/cambiar.
 */
export function useRecentlyViewed(trackId?: string) {
  const [ids, setIds] = useState<string[]>(read);

  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!trackId) return;
    const current = read();
    const next = [trackId, ...current.filter((x) => x !== trackId)].slice(0, MAX);
    write(next);
  }, [trackId]);

  const clear = useCallback(() => write([]), []);

  return { ids, clear };
}
