import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/button/Button";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import type { Product } from "@/types/product";
import { cardReveal } from "@/utils/animations";
import { formatPrice } from "@/utils/formatting";

type ProductCardProps = {
  product: Product;
};

function CreditCardIcon() {
  return (
    <svg
      width="26"
      height="18"
      viewBox="0 0 26 18"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="0.5" y="0.5" width="25" height="17" rx="2.5" stroke="currentColor" strokeWidth="1" />
      <rect y="4" width="26" height="3" fill="currentColor" fillOpacity="0.15" />
      <rect x="2.5" y="10" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, justAdded } = useAddToCart();
  const outOfStock = product.stock === 0;

  const transferPrice   = Math.round(product.price * 0.9);
  const installmentPrice = Math.round((product.price * 1.1) / 6);

  // Construir array de imágenes con backward compat
  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];

  const hasMultiple = images.length > 1;
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const handleMouseEnter = () => {
    if (!hasMultiple) return;
    setCurrentIndex(1);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
  };

  const handleMouseLeave = () => {
    if (!hasMultiple) return;
    clearInterval(intervalRef.current);
    setCurrentIndex(0);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleAdd = () => addToCart(product);

  return (
    <motion.article
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="group bg-cream-50 border border-sepia-300 rounded-xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div
          className="aspect-square overflow-hidden bg-cream-100 relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {hasMultiple ? (
            <>
              {images.map((url, i) => (
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

              {/* Puntitos indicadores */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      i === currentIndex
                        ? "bg-cream-50 scale-125"
                        : "bg-cream-50/50",
                    ].join(" ")}
                  />
                ))}
              </div>
            </>
          ) : (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

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
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-semibold text-leather-900 leading-tight line-clamp-2 hover:text-leather-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="pt-2 border-t border-sepia-300/60 mt-auto space-y-1.5">
          <span className="block font-display text-xl font-bold text-leather-900">
            {formatPrice(product.price)}
          </span>

          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-display text-base font-bold text-field-500">
              {formatPrice(transferPrice)}
            </span>
            <span className="text-xs text-leather-500 leading-tight">
              pagando con transferencia
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-leather-600">
            <span className="text-xs font-medium">
              6 x {formatPrice(installmentPrice)} pagando con
            </span>
            <CreditCardIcon />
          </div>
        </div>

        <Button
          size="sm"
          fullWidth
          disabled={outOfStock || justAdded}
          onClick={handleAdd}
          className="mt-1"
        >
          {justAdded ? "Agregado" : "Agregar"}
        </Button>
      </div>
    </motion.article>
  );
}
