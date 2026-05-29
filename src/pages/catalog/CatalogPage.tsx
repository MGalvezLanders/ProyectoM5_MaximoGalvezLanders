import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { useCatalog } from "@/context/CatalogContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getCategories } from "@/services/product/products.service";
import { fadeUp, stagger } from "@/utils/animations";

const CatalogPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 400);
  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadFirstPage,
    loadMore,
  } = useCatalog();

  // El prefijo de búsqueda se aplica en Firestore solo con 2+ caracteres.
  const searchPrefix = debouncedSearch.trim();

  // Cada vez que cambian los filtros, recargamos desde la primera página.
  useEffect(() => {
    loadFirstPage({
      category,
      searchPrefix: searchPrefix.length >= 2 ? searchPrefix : undefined,
    });
  }, [category, searchPrefix, loadFirstPage]);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const refetch = () =>
    loadFirstPage({
      category,
      searchPrefix: searchPrefix.length >= 2 ? searchPrefix : undefined,
    });

  const handleClearFilters = () => {
    setSearch("");
    setCategory(undefined);
  };

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

        {/* Filtros */}
        <motion.section
          aria-label="Filtros de productos"
          className="mb-8 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative flex-1 max-w-md">
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

          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setCategory(undefined)}
              className={[
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                category === undefined
                  ? "bg-leather-600 text-cream-50 border-leather-600"
                  : "bg-cream-50 text-leather-700 border-sepia-400 hover:bg-cream-100",
              ].join(" ")}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize",
                  category === cat
                    ? "bg-leather-600 text-cream-50 border-leather-600"
                    : "bg-cream-50 text-leather-700 border-sepia-400 hover:bg-cream-100",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.section>

        {/* Estados */}
        {loading && (
          <div
            role="status"
            aria-label="Cargando productos"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
            <span className="sr-only">Cargando productos...</span>
          </div>
        )}

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

        {!loading && !error && products.length > 0 && (
          <>
            <motion.p
              className="text-sm text-leather-600 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {products.length} producto{products.length === 1 ? "" : "s"}
              {category && ` en "${category}"`}
              {debouncedSearch && ` para "${debouncedSearch}"`}
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              {hasMore ? (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Cargando..." : "Cargar más"}
                </Button>
              ) : (
                <p className="text-sm text-leather-500">
                  No hay más productos.
                </p>
              )}
            </div>
          </>
        )}
      </Container>
    </main>
  );
};

export default CatalogPage;
