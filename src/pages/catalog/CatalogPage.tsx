import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { FeatureProductCard } from "@/components/product/FeatureProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import {
  CatalogFilters,
  CATEGORY_GROUPS,
  MATE_SUBTYPES,
  type PriceRange,
  type SortBy,
} from "@/components/catalog/CatalogFilters";
import { useCatalog } from "@/context/CatalogContext";
import { useProductsList } from "@/hooks/products/useProductsList";
import { useDebounce } from "@/hooks/useDebounce";
import { matchProductFuzzy, assignGroup } from "@/utils/filters";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { fadeUp, stagger } from "@/utils/animations";

const PRICE_BOUNDS: Record<PriceRange, [number, number]> = {
  low:     [0,      10_000],
  mid:     [10_000, 25_000],
  high:    [25_000, 60_000],
  premium: [60_000, Infinity],
};

const isPriceRange = (v: string | null): v is PriceRange =>
  v === "low" || v === "mid" || v === "high" || v === "premium";
const isSortBy = (v: string | null): v is SortBy =>
  v === "default" || v === "price-asc" || v === "price-desc" || v === "newest";

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL como source of truth para filtros
  const rawGroup    = searchParams.get("group")?.toLowerCase().trim();
  const rawCategory = searchParams.get("category")?.toLowerCase().trim();
  const rawPrice    = searchParams.get("price");
  const rawSort     = searchParams.get("sort");

  // Backward compat: si viene `?category=xxx` sin `?group=`, inferimos el grupo.
  const inferredGroup = rawGroup ?? (rawCategory ? assignGroup(rawCategory) ?? rawCategory : undefined);

  const group       = inferredGroup || undefined;
  const category    = rawCategory && rawCategory !== group ? rawCategory : undefined;
  const priceRange  = isPriceRange(rawPrice) ? rawPrice : undefined;
  const onlyInStock = searchParams.get("stock") === "1";
  const sortBy: SortBy = isSortBy(rawSort) ? rawSort : "default";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  // Helper para actualizar query params. Toma un snapshot vivo de la URL
  // (window.location.search) en lugar del prev-ref de react-router, que puede
  // quedar stale si hay múltiples llamadas en el mismo tick.
  const updateParams = useCallback(
    (patch: Record<string, string | undefined | null | false>) => {
      const p = new URLSearchParams(window.location.search);
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === null || v === "" || v === false) p.delete(k);
        else p.set(k, String(v));
      }
      setSearchParams(p, { replace: true });
    },
    [setSearchParams],
  );

  const setGroup = useCallback(
    (g: string | undefined) => updateParams({ group: g, category: undefined }),
    [updateParams],
  );
  const setCategory = useCallback(
    (c: string | undefined) => updateParams({ category: c }),
    [updateParams],
  );
  const setPriceRange = useCallback(
    (p: PriceRange | undefined) => updateParams({ price: p }),
    [updateParams],
  );
  const setOnlyInStock = useCallback(
    (v: boolean) => updateParams({ stock: v ? "1" : undefined }),
    [updateParams],
  );
  const setSortBy = useCallback(
    (s: SortBy) => updateParams({ sort: s === "default" ? undefined : s }),
    [updateParams],
  );

  // Bloquea scroll del body cuando el drawer mobile está abierto
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const debouncedSearch = useDebounce(search, 250);
  const trimmedSearch   = debouncedSearch.trim();
  const isSearching     = trimmedSearch.length >= 2;

  // Sync input local (debounced) → URL
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    if (trimmedSearch !== urlQ) {
      updateParams({ q: trimmedSearch || undefined });
    }
  }, [trimmedSearch, searchParams, updateParams]);

  // Sync URL ?q= → input local (para deep links / buscador global)
  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    setSearch((prev) => (prev.trim() === urlQ ? prev : urlQ));
  }, [searchParams]);

  const {
    products: browseProducts,
    loading: browseLoading,
    loadingMore,
    error: browseError,
    hasMore,
    loadFirstPage,
    loadMore,
  } = useCatalog();

  const {
    products: allProducts,
    loading: allLoading,
    error: allError,
  } = useProductsList();

  const isFiltering =
    isSearching || !!group || !!priceRange || onlyInStock || sortBy !== "default";

  useEffect(() => {
    if (isFiltering) return;
    loadFirstPage({ category: undefined, searchPrefix: undefined });
  }, [isFiltering, loadFirstPage]);

  const displayProducts = useMemo(() => {
    let list = isFiltering ? allProducts : browseProducts;

    if (isSearching) {
      list = list.filter((p) => matchProductFuzzy(p, trimmedSearch));
    }

    if (category) {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    } else if (group) {
      list = list.filter((p) => assignGroup(p.category) === group);
    }

    if (priceRange) {
      const [min, max] = PRICE_BOUNDS[priceRange];
      list = list.filter((p) => p.price >= min && p.price < max);
    }

    if (onlyInStock) {
      list = list.filter((p) => p.stock > 0);
    }

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      list = [...list].sort(
        (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0),
      );
    }

    return list;
  }, [isFiltering, allProducts, browseProducts, isSearching, trimmedSearch, category, group, priceRange, onlyInStock, sortBy]);

  const loading          = isFiltering ? allLoading   : browseLoading;
  const error            = isFiltering ? allError     : browseError;
  const showLoadMore     = !isFiltering && hasMore;
  const hasActiveFilters = isSearching || !!group || !!priceRange || onlyInStock || sortBy !== "default";

  const refetch = () => loadFirstPage({ category: undefined, searchPrefix: undefined });

  const handleClearFilters = () => {
    setSearch("");
    updateParams({
      q: undefined,
      group: undefined,
      category: undefined,
      price: undefined,
      stock: undefined,
      sort: undefined,
    });
  };

  const filterProps = {
    group, category, priceRange, onlyInStock,
    onGroupChange:      setGroup,
    onCategoryChange:   setCategory,
    onPriceRangeChange: setPriceRange,
    onInStockChange:    setOnlyInStock,
    onClear:            handleClearFilters,
    hasActiveFilters,
  };

  // Chips activos — con fallback para grupos/categorías fuera de las listas conocidas
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const groupLabel    = group    ? CATEGORY_GROUPS.find((g) => g.value === group)?.label    ?? capitalize(group)    : undefined;
  const categoryLabel = category ? MATE_SUBTYPES.find((m) => m.value === category)?.label   ?? capitalize(category) : undefined;
  const priceLabelMap: Record<PriceRange, string> = {
    low:     "Hasta $10k",
    mid:     "$10k – $25k",
    high:    "$25k – $60k",
    premium: "Más de $60k",
  };
  const sortLabelMap: Record<Exclude<SortBy, "default">, string> = {
    "price-asc":  "Menor precio",
    "price-desc": "Mayor precio",
    "newest":     "Más nuevos",
  };

  const clearSearch = () => {
    setSearch("");
    updateParams({ q: undefined });
  };

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (isSearching) activeChips.push({
    key: "search", label: `"${trimmedSearch}"`, onRemove: clearSearch,
  });
  if (groupLabel) activeChips.push({
    key: "group", label: groupLabel, onRemove: () => setGroup(undefined),
  });
  if (categoryLabel) activeChips.push({
    key: "category", label: categoryLabel, onRemove: () => setCategory(undefined),
  });
  if (priceRange) activeChips.push({
    key: "price", label: priceLabelMap[priceRange], onRemove: () => setPriceRange(undefined),
  });
  if (onlyInStock) activeChips.push({
    key: "stock", label: "Solo en stock", onRemove: () => setOnlyInStock(false),
  });
  if (sortBy !== "default") activeChips.push({
    key: "sort", label: sortLabelMap[sortBy], onRemove: () => setSortBy("default"),
  });

  return (
    <main className="paper-texture min-h-[calc(100vh-65px)]">
      <Container size="xl" className="py-10 sm:py-14">

        {/* Header */}
        <motion.header
          className="mb-8 max-w-2xl"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-sun-700 mb-2"
          >
            Catálogo
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="font-display text-4xl sm:text-5xl font-bold mb-3"
          >
            Nuestros productos
          </motion.h1>
          <motion.p variants={fadeUp} className="text-leather-700">
            Mates, termos, materas, ponchos, sombreros y boinas hechos con
            tradición. Filtrá por categoría o buscá por nombre.
          </motion.p>
        </motion.header>

        {/* Layout: sidebar + contenido */}
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* ── Sidebar desktop ── */}
          <aside className="hidden md:flex flex-col w-52 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] border border-sepia-300 rounded-xl bg-cream-50 overflow-y-auto">
            <CatalogFilters {...filterProps} />
          </aside>

          {/* ── Drawer mobile ── */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-leather-900/40 z-40 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
                <motion.aside
                  key="drawer"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-y-0 left-0 w-72 bg-cream-50 border-r border-sepia-300 z-50 md:hidden flex flex-col"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-sepia-300 shrink-0">
                    <span className="font-display font-semibold text-leather-900">Filtros</span>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      aria-label="Cerrar filtros"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-leather-700 hover:bg-cream-100 transition-colors"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <CatalogFilters {...filterProps} />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* ── Contenido principal ── */}
          <div className="flex-1 min-w-0">

            {/* Barra: botón mobile + buscador + sort */}
            <motion.div
              className="mb-4 flex gap-3 items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setSidebarOpen(true)}
                className={[
                  "md:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors shrink-0",
                  hasActiveFilters
                    ? "bg-leather-600 text-cream-50 border-leather-600"
                    : "bg-cream-50 text-leather-700 border-sepia-400",
                ].join(" ")}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Filtros
                {activeChips.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-sun-400 text-leather-900 text-[10px] font-bold">
                    {activeChips.length}
                  </span>
                )}
              </button>

              <div className="relative flex-1 min-w-0">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar mate, termo, poncho..."
                  aria-label="Buscar productos"
                  className="w-full px-4 py-2.5 pl-10 rounded-lg bg-cream-50 text-leather-900 placeholder-leather-500/60 border border-sepia-400 focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500 transition-colors"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                </svg>
              </div>

              <label className="hidden sm:flex items-center gap-2 shrink-0">
                <span className="text-xs text-leather-500 whitespace-nowrap">Ordenar</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  aria-label="Ordenar productos"
                  className="px-3 py-2.5 rounded-lg bg-cream-50 text-leather-900 border border-sepia-400 text-sm focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500 transition-colors cursor-pointer"
                >
                  <option value="default">Relevancia</option>
                  <option value="newest">Más nuevos</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </label>
            </motion.div>

            {/* Sort mobile (bajo la barra) */}
            <div className="sm:hidden mb-4">
              <label className="flex items-center gap-2">
                <span className="text-xs text-leather-500 shrink-0">Ordenar</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  aria-label="Ordenar productos"
                  className="flex-1 px-3 py-2 rounded-lg bg-cream-50 text-leather-900 border border-sepia-400 text-sm focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500 transition-colors"
                >
                  <option value="default">Relevancia</option>
                  <option value="newest">Más nuevos</option>
                  <option value="price-asc">Menor precio</option>
                  <option value="price-desc">Mayor precio</option>
                </select>
              </label>
            </div>

            {/* Chips de filtros activos */}
            {activeChips.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                {activeChips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={c.onRemove}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-leather-700 text-cream-50 text-xs font-medium hover:bg-leather-800 transition-colors group"
                  >
                    {c.label}
                    <svg className="w-3 h-3 opacity-70 group-hover:opacity-100" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                    </svg>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-leather-500 hover:text-terracota-500 underline underline-offset-2 ml-1 transition-colors"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Skeleton */}
            {loading && (
              <div
                role="status"
                aria-label="Cargando productos"
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 auto-rows-fr"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
                <span className="sr-only">Cargando productos...</span>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="text-center py-20 max-w-md mx-auto">
                <p className="text-terracota-500 font-medium mb-3">
                  No pudimos cargar los productos.
                </p>
                <p className="text-sm text-leather-700 mb-6">{error}</p>
                <Button onClick={refetch} variant="outline">
                  Reintentar
                </Button>
              </div>
            )}

            {/* Sin resultados */}
            {!loading && !error && displayProducts.length === 0 && (
              <div className="text-center py-16 max-w-xl mx-auto">
                <div className="inline-flex w-16 h-16 rounded-full bg-cream-100 border border-sepia-300 items-center justify-center text-leather-500 mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-semibold mb-2">
                  No encontramos productos
                </h2>
                <p className="text-leather-700 mb-6">
                  {hasActiveFilters
                    ? "Probá ajustar los filtros o explorá otra categoría."
                    : "Todavía no hay productos cargados en el catálogo."}
                </p>
                {hasActiveFilters && (
                  <>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Limpiar filtros
                    </Button>
                    <div className="mt-8">
                      <p className="text-xs font-semibold uppercase tracking-widest text-leather-500 mb-3">
                        Categorías populares
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {CATEGORY_GROUPS.slice(0, 6).map((g) => (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => {
                              handleClearFilters();
                              setGroup(g.value);
                            }}
                            className="px-3 py-1.5 rounded-full bg-cream-50 border border-sepia-400 text-sm text-leather-700 hover:border-leather-500 hover:text-leather-900 transition-colors"
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Productos */}
            {!loading && !error && displayProducts.length > 0 && (
              <>
                <motion.p
                  className="text-sm text-leather-600 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {displayProducts.length} producto{displayProducts.length === 1 ? "" : "s"}
                  {isSearching && ` para "${debouncedSearch}"`}
                </motion.p>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 xl:gap-8 auto-rows-fr">
                  {displayProducts.map((product, i) => {
                    //* Insertamos un destacado grande cada 9 productos —
                    //* solo cuando NO hay filtros activos (para no romper el orden esperado del filtro).
                    const isFeature = !hasActiveFilters && i > 0 && i % 9 === 0;
                    return isFeature ? (
                      <FeatureProductCard key={product.id} product={product} />
                    ) : (
                      <ProductCard key={product.id} product={product} />
                    );
                  })}
                </div>

                <div className="mt-10 flex justify-center">
                  {showLoadMore ? (
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <span className="flex items-center gap-2">
                          <SolDeMayo className="w-5 h-5" spin={1.5} />
                          Cargando...
                        </span>
                      ) : (
                        "Cargar más"
                      )}
                    </Button>
                  ) : (
                    <p className="text-sm text-leather-500">
                      {isFiltering
                        ? "Estos son todos los resultados."
                        : "No hay más productos."}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
};

export default CatalogPage;
