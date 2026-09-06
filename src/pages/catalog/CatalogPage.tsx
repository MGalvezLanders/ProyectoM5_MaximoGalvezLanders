import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { CatalogSidebar } from "@/components/catalog/CatalogSidebar";
import { useCatalog } from "@/context/CatalogContext";
import { useProductsList } from "@/hooks/products/useProductsList";
import { useDebounce } from "@/hooks/useDebounce";
import { getCategories } from "@/services/product/products.service";
import { matchProductFuzzy } from "@/utils/filters";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { fadeUp, stagger } from "@/utils/animations";

const CatalogPage = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(
    searchParams.get("category") ?? undefined
  );
  const [categories, setCategories] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setCategory(searchParams.get("category") ?? undefined);
  }, [searchParams]);

  const debouncedSearch = useDebounce(search, 250);

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

  const trimmedSearch = debouncedSearch.trim();
  const isSearching = trimmedSearch.length >= 2;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    return allProducts.filter((p) => matchProductFuzzy(p, trimmedSearch));
  }, [allProducts, trimmedSearch, isSearching]);

  useEffect(() => {
    if (isSearching) return;
    loadFirstPage({ category, searchPrefix: undefined });
  }, [category, isSearching, loadFirstPage]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const refetch = () => loadFirstPage({ category, searchPrefix: undefined });

  const handleClearFilters = () => {
    setSearch("");
    setCategory(undefined);
  };

  const products = isSearching ? searchResults : browseProducts;
  const loading = isSearching ? allLoading : browseLoading;
  const error = isSearching ? allError : browseError;
  const showLoadMore = !isSearching && hasMore;

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
            className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-arg-700 mb-2"
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

          {/* Sidebar de categorías */}
          <CatalogSidebar
            category={category}
            onSelect={setCategory}
            firestoreCategories={categories}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">

            {/* Barra superior: filtros mobile + buscador */}
            <motion.div
              className="mb-6 flex gap-3 items-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Botón filtros mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className={[
                  "md:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors shrink-0",
                  category
                    ? "bg-leather-600 text-cream-50 border-leather-600"
                    : "bg-cream-50 text-leather-700 border-sepia-400",
                ].join(" ")}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Filtros
                {category && (
                  <span className="w-2 h-2 rounded-full bg-sun-400 shrink-0" />
                )}
              </button>

              {/* Buscador */}
              <div className="relative flex-1">
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
            </motion.div>

            {/* Skeleton */}
            {loading && (
              <div
                role="status"
                aria-label="Cargando productos"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
              >
                {Array.from({ length: 10 }).map((_, i) => (
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
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-20 max-w-md mx-auto">
                <h2 className="font-display text-2xl font-semibold mb-2">
                  No encontramos productos
                </h2>
                <p className="text-leather-700 mb-6">
                  {debouncedSearch || category
                    ? "Probá con otros filtros o limpialos para ver todo el catálogo."
                    : "Todavía no hay productos cargados en el catálogo."}
                </p>
                {(debouncedSearch || category) && (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            )}

            {/* Productos */}
            {!loading && !error && products.length > 0 && (
              <>
                <motion.p
                  className="text-sm text-leather-600 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {products.length} producto{products.length === 1 ? "" : "s"}
                  {isSearching
                    ? ` para "${debouncedSearch}" en todo el catálogo`
                    : category && ` en "${category}"`}
                </motion.p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
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
                      {isSearching
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
