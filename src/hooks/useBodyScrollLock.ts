import { useEffect } from "react";

/**
 * Bloquea el scroll del body mientras `active` sea true.
 * Restaura el valor previo del `overflow` al desactivarse o desmontar.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
