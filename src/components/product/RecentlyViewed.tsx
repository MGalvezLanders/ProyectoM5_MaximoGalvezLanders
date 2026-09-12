import { useMemo } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useProductsList } from "@/hooks/products/useProductsList";
import { formatPrice } from "@/utils/formatting";

type Props = {
  /** Id a excluir del bloque (típicamente el producto que se está viendo). */
  excludeId?: string;
  className?: string;
};

export function RecentlyViewed({ excludeId, className = "" }: Props) {
  const { ids } = useRecentlyViewed();
  const { products } = useProductsList();

  const items = useMemo(() => {
    return ids
      .filter((id) => id !== excludeId)
      .map((id) => products.find((p) => p.id === id))
      .filter(<T,>(p: T | undefined): p is T => p !== undefined)
      .slice(0, 6);
  }, [ids, products, excludeId]);

  if (items.length === 0) return null;

  return (
    <section className={className}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="mb-5 flex items-baseline justify-between gap-4"
      >
        <h2 className="font-display text-2xl font-bold text-leather-900">
          Vistos recientemente
        </h2>
        <span className="text-xs text-leather-500">
          {items.length} {items.length === 1 ? "producto" : "productos"}
        </span>
      </motion.div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((p) => (
          <Link
            key={p.id}
            to={`/products/${p.id}`}
            className="group block bg-cream-50 border border-sepia-300 rounded-lg overflow-hidden hover:shadow-warm-sm hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50"
          >
            <div className="aspect-square bg-cream-100 overflow-hidden">
              <img
                src={p.imageUrl}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-2">
              <p className="text-xs font-medium text-leather-800 line-clamp-1 leading-tight">
                {p.name}
              </p>
              <p className="text-xs font-display font-bold text-leather-900 mt-0.5">
                {formatPrice(p.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
