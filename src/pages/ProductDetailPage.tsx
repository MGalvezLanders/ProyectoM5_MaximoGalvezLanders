import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { QuantityInput } from "@/components/ui/QuantityInput";
import { Spinner } from "@/components/ui/Spinner";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { useProduct } from "@/hooks/useProduct";
import type { Product } from "@/types/product";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

type StockBadge = {
  label: string;
  tone: "field" | "sun" | "danger" | "neutral";
};

const getStockBadge = (stock: number): StockBadge => {
  if (stock === 0) return { label: "Sin stock", tone: "danger" };
  if (stock <= 3) return { label: "Últimas unidades", tone: "sun" };
  if (stock <= 10) return { label: "Pocas unidades", tone: "sun" };
  return { label: "Disponible", tone: "field" };
};

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, notFound } = useProduct(id);

  return (
    <main className="paper-texture min-h-[calc(100vh-65px)]">
      <Container size="lg" className="py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: "Inicio", to: "/" },
            { label: "Catálogo", to: "/catalog" },
            { label: product?.name ?? "Producto" },
          ]}
          className="mb-6"
        />

        {loading && <ProductDetailSkeleton />}

        {!loading && error && (
          <div className="text-center py-20 max-w-md mx-auto">
            <p className="text-terracota-500 font-medium mb-3">
              No pudimos cargar el producto.
            </p>
            <p className="text-sm text-leather-700 mb-6">{error}</p>
            <Link to="/catalog">
              <Button variant="outline">Volver al catálogo</Button>
            </Link>
          </div>
        )}

        {!loading && !error && notFound && (
          <div className="text-center py-20 max-w-md mx-auto">
            <SolDeMayo className="w-16 h-16 text-sun-500 mx-auto mb-4 opacity-70" />
            <h1 className="font-display text-3xl font-bold mb-2">
              Producto no encontrado
            </h1>
            <p className="text-leather-700 mb-6">
              El producto que buscás no existe o fue dado de baja.
            </p>
            <Link to="/catalog">
              <Button>Volver al catálogo</Button>
            </Link>
          </div>
        )}

        {!loading && !error && product && (
          <ProductDetailContent product={product} />
        )}
      </Container>
    </main>
  );
};

function ProductDetailContent({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const stockBadge = getStockBadge(product.stock);
  const outOfStock = product.stock === 0;

  const handleAddToCart = () => {
    // Placeholder hasta etapa 4 (CartContext)
    console.info("[ProductDetail] Agregar al carrito:", {
      productId: product.id,
      quantity,
    });
    alert(`Agregado al carrito: ${quantity} × ${product.name}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen */}
        <div className="bg-cream-100 border border-sepia-300 rounded-2xl overflow-hidden shadow-warm">
          <div className="aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Badge tone="sky" className="capitalize">
              {product.category}
            </Badge>
            <Badge tone={stockBadge.tone}>{stockBadge.label}</Badge>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leather-900 mb-3 leading-tight">
            {product.name}
          </h1>

          <p className="text-leather-700 leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="border-t border-sepia-300 pt-6 mb-6">
            <span className="block text-xs uppercase tracking-wider text-leather-500 mb-1">
              Precio
            </span>
            <span className="font-display text-4xl font-bold text-leather-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <dt className="text-leather-500 uppercase tracking-wider text-xs mb-1">
                Stock
              </dt>
              <dd className="text-leather-900 font-medium">
                {product.stock} unidad{product.stock === 1 ? "" : "es"}
              </dd>
            </div>
            <div>
              <dt className="text-leather-500 uppercase tracking-wider text-xs mb-1">
                Categoría
              </dt>
              <dd className="text-leather-900 font-medium capitalize">
                {product.category}
              </dd>
            </div>
          </dl>

          {!outOfStock && (
            <div className="flex items-center gap-3 mb-6">
              <label className="text-sm font-medium text-leather-700">
                Cantidad:
              </label>
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={product.stock}
              />
            </div>
          )}

          <Button
            size="lg"
            fullWidth
            disabled={outOfStock}
            onClick={handleAddToCart}
          >
            {outOfStock ? "Sin stock" : "Agregar al carrito"}
          </Button>

          <p className="mt-4 text-xs text-leather-500 text-center">
            Envíos a todo el país · Pagás cuando lo recibís
          </p>
        </div>
      </div>

      {/* Volver al catálogo */}
      <div className="mt-12 pt-8 border-t border-sepia-300 text-center">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-sm font-medium text-leather-700 hover:text-leather-900 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>
      </div>
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando producto"
      className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 animate-pulse"
    >
      <div className="aspect-square bg-cream-200 rounded-2xl" />
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-cream-200 rounded-full" />
          <div className="h-6 w-24 bg-cream-200 rounded-full" />
        </div>
        <div className="h-10 bg-cream-200 rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-3 bg-cream-200 rounded" />
          <div className="h-3 bg-cream-200 rounded" />
          <div className="h-3 bg-cream-200 rounded w-5/6" />
        </div>
        <div className="h-12 w-40 bg-cream-200 rounded mt-4" />
        <div className="h-12 bg-cream-200 rounded mt-4" />
      </div>
      <span className="sr-only">
        <Spinner /> Cargando producto...
      </span>
    </div>
  );
}

export default ProductDetailPage;
