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
    <section className="bg-cream-50 py-24 sm:py-28 overflow-hidden">
      <Container size="xl">
        {/* Encabezado asimétrico — sin rayitas decorativas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 flex items-end justify-between gap-6 flex-wrap"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase text-leather-600 mb-3">
              <span className="w-6 h-px bg-leather-400" />
              Lo más elegido
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-semibold text-leather-900 leading-[1.05]">
              Más vendidos
            </h2>
            <p className="text-stone-500 text-sm mt-2">
              Los favoritos de nuestra comunidad
            </p>
          </div>
          <Link
            to="/catalog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-leather-700 hover:text-leather-900 link-fancy"
            data-underline="true"
          >
            Ver todo →
          </Link>
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
                {current.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
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

      </Container>
    </section>
  );
}
