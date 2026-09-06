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

  const transferPrice = Math.round(product.price * 0.9);
  const installmentPrice = Math.round((product.price * 1.1) / 6);

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
        <div className="aspect-square overflow-hidden bg-cream-100 relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
{outOfStock && (
            <div className="absolute inset-0 bg-leather-900/50 flex items-center justify-center">
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

{/* Bloque de precios */}
        <div className="pt-2 border-t border-sepia-300/60 mt-auto space-y-1.5">
          {/* Precio base */}
          <span className="block font-display text-xl font-bold text-leather-900">
            {formatPrice(product.price)}
          </span>

          {/* Precio con transferencia */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-display text-base font-bold text-field-500">
              {formatPrice(transferPrice)}
            </span>
            <span className="text-xs text-leather-500 leading-tight">
              pagando con transferencia
            </span>
          </div>

          {/* Cuotas */}
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
