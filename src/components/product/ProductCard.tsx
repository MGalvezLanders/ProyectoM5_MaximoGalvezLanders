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

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, justAdded } = useAddToCart();
  const outOfStock = product.stock === 0;

  const handleAdd = () => addToCart(product);

  return (
    <motion.article
      variants={cardReveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="group bg-cream-50 border border-sepia-300 rounded-xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-cream-100 relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge tone="sky">{product.category}</Badge>
          </div>
          {outOfStock && (
            <div className="absolute inset-0 bg-leather-900/50 flex items-center justify-center">
              <Badge tone="danger" className="text-sm">
                Sin stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display text-lg font-semibold text-leather-900 leading-tight line-clamp-2 hover:text-leather-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-leather-700 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="flex items-end justify-between pt-2 border-t border-sepia-300/60">
          <div>
            <span className="block text-xs uppercase tracking-wider text-leather-500">
              Precio
            </span>
            <span className="font-display text-xl font-bold text-leather-900">
              {formatPrice(product.price)}
            </span>
          </div>
          <Button
            size="sm"
            disabled={outOfStock || justAdded}
            onClick={handleAdd}
          >
            {justAdded ? "Agregado" : "Agregar"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
