import { useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/button/Button";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/formatting";
import { getProductRating } from "@/utils/reviews";
import { StarRating } from "@/components/ui/StarRating";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, justAdded } = useAddToCart();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(product.id);
  const outOfStock = product.stock === 0;
  const rating = getProductRating(product.id);

  const handleFavClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  // Construir array de imágenes con backward compat
  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];

  const hasMultiple = images.length > 1;
  const [hovered, setHovered] = useState(false);
  const currentIndex = hovered && hasMultiple ? 1 : 0;

  const handleAdd = () => addToCart(product);

  return (
    <article
      className="group bg-cream-50 border border-sepia-300 radius-card overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      <Link
        to={`/products/${product.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 rounded-t-xl"
      >
        <div
          className="aspect-square overflow-hidden bg-cream-100 relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {hasMultiple ? (
            <>
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
            </>
          ) : (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* Chip de descuento por transferencia */}
          {!outOfStock && (
            <span className="absolute top-2 left-2 z-10 inline-flex items-center px-2 py-0.5 rounded-full bg-leather-900 text-sun-400 text-[10px] font-bold tracking-wide shadow-sm">
              10% OFF transferencia
            </span>
          )}

          {/* Favorito */}
          <button
            type="button"
            onClick={handleFavClick}
            aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={fav}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-cream-50/85 backdrop-blur-sm hover:bg-cream-50 flex items-center justify-center shadow-sm transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60"
          >
            <svg
              className={`w-4 h-4 transition-colors ${fav ? "text-terracota-500" : "text-leather-500"}`}
              viewBox="0 0 20 20"
              fill={fav ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 17s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 9c0 4.5-6 8-6 8z" />
            </svg>
          </button>

          {outOfStock && (
            <div className="absolute inset-0 bg-leather-900/50 flex items-center justify-center z-20">
              <Badge tone="danger" className="text-sm">
                Sin stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link
          to={`/products/${product.id}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50 rounded"
        >
          <h3 className="font-display text-base sm:text-lg font-semibold text-leather-900 leading-tight line-clamp-2 hover:text-leather-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5">
          <StarRating value={rating.average} size={12} />
          <span className="text-[11px] text-leather-500">
            {rating.average.toFixed(1)} ({rating.count})
          </span>
        </div>

        <div className="mt-auto pt-2 border-t border-sepia-300/60">
          <span className="block font-display text-xl font-bold text-leather-900">
            {formatPrice(product.price)}
          </span>
          <span className="text-[11px] text-leather-500">
            o 6 cuotas sin interés
          </span>
        </div>

        <Button
          size="sm"
          fullWidth
          disabled={outOfStock || justAdded}
          onClick={handleAdd}
          className="mt-1"
        >
          {justAdded ? "Agregado" : "Agregar al carrito"}
        </Button>
      </div>
    </article>
  );
}
