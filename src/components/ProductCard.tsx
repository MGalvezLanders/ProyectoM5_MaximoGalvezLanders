import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock === 0;

  return (
    <article className="group bg-cream-50 border border-sepia-300 rounded-xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-200">
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
          <Button size="sm" disabled={outOfStock}>
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
}
