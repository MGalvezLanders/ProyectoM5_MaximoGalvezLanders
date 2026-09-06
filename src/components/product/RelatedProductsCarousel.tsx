import { useRef } from "react";
import { motion } from "motion/react";
import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { useRelatedProducts } from "@/hooks/products/useRelatedProducts";

interface RelatedProductsCarouselProps {
  currentId: string;
  category: string;
}

const SCROLL_PX = 300;

export function RelatedProductsCarousel({
  currentId,
  category,
}: RelatedProductsCarouselProps) {
  const { products, isMixed, loading } = useRelatedProducts(currentId, category);
  const trackRef = useRef<HTMLDivElement>(null);

  if (!loading && products.length === 0) return null;

  const scroll = (dir: "prev" | "next") => {
    trackRef.current?.scrollBy({
      left: dir === "next" ? SCROLL_PX : -SCROLL_PX,
      behavior: "smooth",
    });
  };

  const sectionTitle = isMixed ? "También te puede interesar" : `Más en ${category}`;
  const sectionLabel = isMixed ? "Destacados" : category;

  return (
    <motion.section
      aria-label={sectionTitle}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="block text-xs font-semibold tracking-widest uppercase text-sky-arg-700 mb-1 capitalize">
            {sectionLabel}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-leather-900">
            {sectionTitle}
          </h2>
        </div>

        <div className="flex gap-2 shrink-0 ml-4">
          <button
            onClick={() => scroll("prev")}
            aria-label="Ver anteriores"
            className="w-9 h-9 rounded-full border border-sepia-400 bg-cream-50 text-leather-700 flex items-center justify-center hover:bg-cream-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            onClick={() => scroll("next")}
            aria-label="Ver siguientes"
            className="w-9 h-9 rounded-full border border-sepia-400 bg-cream-50 text-leather-700 flex items-center justify-center hover:bg-cream-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-72 [scroll-snap-align:start]"
              >
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((product) => (
              <div
                key={product.id}
                className="shrink-0 w-72 [scroll-snap-align:start]"
              >
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </motion.section>
  );
}
