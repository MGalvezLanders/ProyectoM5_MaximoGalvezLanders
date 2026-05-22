import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  listProducts,
  type ListProductsParams,
} from "@/services/products.service";
import type { Product } from "@/types/product";
import type { DocumentSnapshot } from "firebase/firestore";

const PAGE_SIZE = 10;

type CatalogFilters = Pick<ListProductsParams, "category" | "searchPrefix">;

type CatalogState = {
  products: Product[];
  loading: boolean; // primera página
  loadingMore: boolean; // páginas siguientes
  error: string | null;
  hasMore: boolean;
};

type CatalogContextValue = CatalogState & {
  loadFirstPage: (filters: CatalogFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
};

const CatalogContext = createContext<CatalogContextValue | undefined>(
  undefined,
);

const INITIAL_STATE: CatalogState = {
  products: [],
  loading: false,
  loadingMore: false,
  error: null,
  hasMore: true,
};

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>(INITIAL_STATE);

  // El cursor y los filtros viven en refs: no necesitan re-render y mantienen
  // estables las callbacks (loadMore no se recrea en cada página).
  const cursorRef = useRef<DocumentSnapshot | null>(null);
  const filtersRef = useRef<CatalogFilters>({});

  const loadFirstPage = useCallback(async (filters: CatalogFilters) => {
    filtersRef.current = filters;
    cursorRef.current = null;

    setState({
      products: [],
      loading: true,
      loadingMore: false,
      error: null,
      hasMore: true,
    });

    try {
      const { items, lastDoc } = await listProducts({
        ...filters,
        pageSize: PAGE_SIZE,
      });
      cursorRef.current = lastDoc;
      setState({
        products: items,
        loading: false,
        loadingMore: false,
        error: null,
        hasMore: items.length === PAGE_SIZE,
      });
    } catch (e) {
      setState((s) => ({
        ...s,
        loading: false,
        error: e instanceof Error ? e.message : "Error al cargar productos",
      }));
    }
  }, []);

  const loadMore = useCallback(async () => {
    // Guard: no pedir más si ya estamos cargando, no hay cursor o no hay más.
    if (!cursorRef.current) return;

    setState((s) => {
      if (s.loadingMore || !s.hasMore) return s;
      return { ...s, loadingMore: true };
    });

    try {
      const { items, lastDoc } = await listProducts({
        ...filtersRef.current,
        pageSize: PAGE_SIZE,
        cursor: cursorRef.current,
      });
      cursorRef.current = lastDoc;
      setState((s) => ({
        ...s,
        products: [...s.products, ...items],
        loadingMore: false,
        hasMore: items.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({
        ...s,
        loadingMore: false,
        error: e instanceof Error ? e.message : "Error al cargar más",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    cursorRef.current = null;
    filtersRef.current = {};
    setState(INITIAL_STATE);
  }, []);

  return (
    <CatalogContext.Provider
      value={{ ...state, loadFirstPage, loadMore, reset }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error("useCatalog debe usarse dentro de <CatalogProvider>");
  }
  return ctx;
}
