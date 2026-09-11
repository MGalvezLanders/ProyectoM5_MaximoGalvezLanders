import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/product/ProductCard";
import { useBestSellers } from "@/hooks/products/useBestSellers";

const INTERVAL = 5000;

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
};

const MEDALS = ["🥇", "🥈", "🥉"];

function SkeletonCard() {
  return (
    <div className="bg-sepia-200 rounded-xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-sepia-300" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-sepia-300 rounded w-3/4" />
        <div className="h-4 bg-sepia-300 rounded w-1/2" />
        <div className="h-8 bg-sepia-300 rounded mt-3" />
      </div>
    </div>
  );
}

export function BestSellersSlider() {
  const { products, loading } = useBestSellers();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  const pages = [products.slice(0, 4), products.slice(4, 8)].filter(
    (p) => p.length > 0,
  );
  const totalPages = pages.length;

  useEffect(() => {
    if (totalPages <= 1) return;
    const id = setInterval(() => {
      setDirection(1);
      setPage((p) => (p + 1) % totalPages);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [totalPages]);

  const goTo = (idx: number) => {
    setDirection(idx > page ? 1 : -1);
    setPage(idx);
  };

  const current = pages[page] ?? [];

  return (
    <section className="bg-cream-50 py-20 overflow-hidden">
      <Container size="xl">
        {/* Encabezado */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-px flex-1 bg-sun-500/40 max-w-24" />
            <span className="text-sun-600 text-xs font-bold tracking-[0.2em] uppercase">
              Lo más elegido
            </span>
            <div className="h-px flex-1 bg-sun-500/40 max-w-24" />
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-leather-900 mb-2">
            Más Vendidos
          </h2>
          <p className="text-leather-600 text-sm">
            Los favoritos de nuestra comunidad
          </p>
        </motion.div>

        {/* Slider */}
        <div className="relative overflow-hidden">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
              >
                {current.map((product, i) => {
                  const rank = page * 4 + i + 1;
                  return (
                    <div key={product.id} className="relative">
                      {/* Badge de ranking */}
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-leather-900/80 backdrop-blur-sm text-sun-400 text-xs font-bold px-2 py-0.5 rounded-full border border-sun-500/30">
                        {rank <= 3 ? MEDALS[rank - 1] : null}
                        <span>#{rank}</span>
                      </div>
                      <ProductCard product={product} />
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Controles */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-4">
            {/* Barra de progreso */}
            <div className="w-48 h-0.5 bg-sepia-300 rounded-full overflow-hidden">
              <motion.div
                key={page}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                className="h-full bg-sun-500 rounded-full"
              />
            </div>

            {/* Dots */}
            <div className="flex items-center gap-3">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a página ${i + 1}`}
                  className={[
                    "rounded-full transition-all duration-300",
                    i === page
                      ? "w-6 h-2.5 bg-sun-500"
                      : "w-2.5 h-2.5 bg-sepia-400 hover:bg-sepia-500",
                  ].join(" ")}
                />
              ))}
            </div>

            {/* Etiquetas de página */}
            <p className="text-leather-500 text-xs">
              Mostrando {page * 4 + 1}–{Math.min((page + 1) * 4, products.length)} de{" "}
              {products.length} productos
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-sun-600 hover:text-sun-700 font-semibold text-sm transition-colors group"
          >
            Ver catálogo completo
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
