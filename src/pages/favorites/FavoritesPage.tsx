import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useProductsList } from "@/hooks/products/useProductsList";
import { fadeUp, stagger } from "@/utils/animations";

export default function FavoritesPage() {
  const { ids, clear } = useFavorites();
  const { products, loading } = useProductsList();

  const favProducts = useMemo(
    () => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [ids, products],
  );

  return (
    <main className="paper-texture min-h-[calc(100vh-65px)]">
      <Container size="xl" className="py-10 sm:py-14">
        <motion.header
          className="mb-8"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-sun-700 mb-2"
          >
            Guardados
          </motion.span>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl font-bold"
            >
              Tus favoritos
            </motion.h1>
            {ids.length > 0 && (
              <motion.button
                variants={fadeUp}
                type="button"
                onClick={clear}
                className="text-sm text-leather-500 hover:text-terracota-500 underline underline-offset-2 transition-colors"
              >
                Vaciar lista
              </motion.button>
            )}
          </div>
          {ids.length > 0 && (
            <motion.p variants={fadeUp} className="text-leather-700 mt-2">
              {ids.length} {ids.length === 1 ? "producto guardado" : "productos guardados"}
            </motion.p>
          )}
        </motion.header>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && favProducts.length === 0 && (
          <div className="text-center py-20 max-w-md mx-auto">
            <div className="inline-flex w-16 h-16 rounded-full bg-cream-100 border border-sepia-300 items-center justify-center text-terracota-500 mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-8-4.5-8-11a5 5 0 018-3.5A5 5 0 0120 10c0 6.5-8 11-8 11z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold mb-2">
              Todavía no guardaste nada
            </h2>
            <p className="text-leather-700 mb-6">
              Tocá el corazón en cualquier producto para guardarlo acá y volver después.
            </p>
            <Link to="/catalog">
              <Button>Ir al catálogo</Button>
            </Link>
          </div>
        )}

        {!loading && favProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favProducts.map(
              (p) => p && <ProductCard key={p.id} product={p} />,
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
