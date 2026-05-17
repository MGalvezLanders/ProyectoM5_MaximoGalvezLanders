import { useEffect, useState } from "react";

/**
 * Devuelve un valor que solo se actualiza después de `delay` ms sin cambios.
 * Útil para no disparar una query por cada tecla en un input de búsqueda.
 *
 * @example
 *   const [search, setSearch] = useState("");
 *   const debouncedSearch = useDebounce(search, 400);
 *   useEffect(() => { fetch(debouncedSearch) }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
