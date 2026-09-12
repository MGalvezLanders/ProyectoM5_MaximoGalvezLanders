import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/button/Button";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/formatting";
import { getProductRating } from "@/utils/reviews";
import { StarRating } from "@/components/ui/StarRating";

type Props = { product: Product };

/**
 * Variante grande del ProductCard para "destacar" cada N ítems del grid.
 * Ocupa 2 columnas × 2 filas — foto grande a un lado, info al otro.
 */
export function FeatureProductCard({ product }: Props) {
  const { addToCart, justAdded } = useAddToCart();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(product.id);
  const outOfStock = product.stock === 0;
  const rating = getProductRating(product.id);

  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];
  const [hovered, setHovered] = useState(false);
  const currentIndex = hovered && images.length > 1 ? 1 : 0;

  const handleFavClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group col-span-2 row-span-2 bg-leather-900 text-cream-50 radius-card overflow-hidden shadow-warm-lg flex flex-col md:flex-row relative"
    >
      {/* Imagen (izquierda en md+) */}
      <Link
        to={`/products/${product.id}`}
        className="block md:flex-1 relative bg-leather-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="aspect-square md:aspect-auto md:h-full overflow-hidden">
          {images.slice(0, 2).map((url, i) => (
            <img
              key={url}
              src={url}
              alt={i === 0 ? product.name : `${product.name} — foto ${i + 1}`}
              loading="lazy"
              className={[
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                i === currentIndex ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Etiqueta "Destacado" con Fraunces */}
        <span
          className="absolute top-4 left-4 z-10 inline-flex items-center gap-1.5 bg-cream-50 text-leather-900 px-3 py-1 radius-ui text-[10px] font-bold tracking-widest uppercase shadow-warm-sm"
        >
          <svg className="w-3 h-3 text-sun-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3 6.9 7.5 1L17 14.6l1.3 7.4L12 18l-6.3 4 1.3-7.4L1.5 9.9 9 8.9 12 2z" />
          </svg>
          Destacado
        </span>

        {outOfStock && (
          <div className="absolute inset-0 bg-leather-900/60 flex items-center justify-center z-20">
            <Badge tone="danger" className="text-sm">
              Sin stock
            </Badge>
          </div>
        )}

        {/* Favorito */}
        <button
          type="button"
          onClick={handleFavClick}
          aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
          aria-pressed={fav}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream-50/95 hover:bg-cream-50 flex items-center justify-center shadow-warm-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60"
        >
          <svg
            className={`w-4 h-4 transition-colors ${fav ? "text-terracota-500" : "text-leather-700"}`}
            viewBox="0 0 24 24"
            fill={fav ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20.5s-8-4.5-8-11a5 5 0 018-3.5A5 5 0 0120 9.5c0 6.5-8 11-8 11z" />
          </svg>
        </button>
      </Link>

      {/* Info (derecha en md+) */}
      <div className="md:flex-1 p-6 sm:p-8 flex flex-col gap-4 justify-between min-w-0">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-sun-400 mb-3">
            {product.category}
          </p>
          <Link
            to={`/products/${product.id}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60 rounded"
          >
            <h3
              className="font-display text-2xl sm:text-3xl font-semibold leading-tight text-cream-50 mb-3 hover:text-sun-400 transition-colors line-clamp-2"
              style={{ fontVariationSettings: '"SOFT" 50' }}
            >
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <StarRating value={rating.average} size={14} />
            <span className="text-xs text-cream-50/60">
              {rating.average.toFixed(1)} · {rating.count} reseñas
            </span>
          </div>

          <p className="text-sm text-cream-50/70 line-clamp-3 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div>
          <div className="mb-4 pb-4 border-b border-cream-50/15">
            <p className="font-display text-3xl font-bold text-cream-50 leading-none mb-1">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs text-cream-50/60">
              o 6 cuotas sin interés
            </p>
          </div>

          <div className="flex gap-2">
            <Link to={`/products/${product.id}`} className="flex-1">
              <Button variant="secondary" size="md" fullWidth>
                Ver detalle
              </Button>
            </Link>
            <button
              type="button"
              disabled={outOfStock || justAdded}
              onClick={() => addToCart(product)}
              className="shrink-0 w-11 h-11 rounded-lg bg-cream-50 text-leather-900 hover:bg-sun-400 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Agregar al carrito"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3h2l2.4 12.3a2 2 0 002 1.7h8.6a2 2 0 002-1.6L21 8H6" />
                <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
