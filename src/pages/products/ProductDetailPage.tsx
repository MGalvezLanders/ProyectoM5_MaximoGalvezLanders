import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { QuantityInput } from "@/components/ui/QuantityInput";
import { Spinner } from "@/components/ui/Spinner";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { BackButton } from "@/components/button/BackButton";
import { useProduct } from "@/hooks/products/useProduct";
import { useAddToCart } from "@/hooks/cart/useAddToCart";
import { formatPrice } from "@/utils/formatting";
import { getStockBadge } from "@/utils/order/stockBadge";
import type { Product } from "@/types/product";
import { RelatedProductsCarousel } from "@/components/product/RelatedProductsCarousel";
import { fadeLeft, fadeRight } from "@/utils/animations";

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
            <SolDeMayo className="w-16 h-16 mx-auto mb-4 opacity-70" />
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

      {!loading && !error && product && (
        <div className="border-t border-sepia-300">
          <Container size="xl" className="py-10">
            <RelatedProductsCarousel
              currentId={product.id}
              category={product.category}
            />
          </Container>
        </div>
      )}
    </main>
  );
};

function CreditCardIcon() {
  return (
    <svg
      width="32"
      height="22"
      viewBox="0 0 32 22"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="0.5" y="0.5" width="31" height="21" rx="2.5" stroke="currentColor" strokeWidth="1" />
      <rect y="5" width="32" height="4" fill="currentColor" fillOpacity="0.12" />
      <rect x="3" y="12" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  );
}

function ProductDetailContent({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, justAdded } = useAddToCart();
  const stockBadge = getStockBadge(product.stock);
  const outOfStock = product.stock === 0;

  const transferPrice = Math.round(product.price * 0.9);
  const installmentPrice = Math.round((product.price * 1.1) / 6);

  const handleAddToCart = () => addToCart(product, quantity);

  return (
    <>
      <BackButton variant="backCatalog" className="mb-6">
        Volver al catálogo
      </BackButton>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Imagen */}
        <motion.div
          variants={fadeLeft}
          initial="hidden"
          animate="visible"
          className="bg-cream-100 border border-sepia-300 rounded-2xl overflow-hidden shadow-warm"
        >
          <div className="aspect-square">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
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

          <div className="border-t border-sepia-300 pt-6 mb-6 space-y-3">
            <span className="block text-xs uppercase tracking-wider text-leather-500">
              Precio
            </span>

            {/* Precio base */}
            <span className="block font-display text-4xl font-bold text-leather-900">
              {formatPrice(product.price)}
            </span>

            {/* Precio con transferencia */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display text-2xl font-bold text-field-500">
                {formatPrice(transferPrice)}
              </span>
              <span className="text-sm text-leather-500">
                pagando con transferencia
              </span>
            </div>

            {/* Cuotas */}
            <div className="flex items-center gap-2 text-leather-700">
              <span className="text-sm font-medium">
                6 x {formatPrice(installmentPrice)} pagando con
              </span>
              <CreditCardIcon />
            </div>
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
            disabled={outOfStock || justAdded}
            onClick={handleAddToCart}
          >
            {outOfStock
              ? "Sin stock"
              : justAdded
                ? "✓ Agregado al carrito"
                : "Agregar al carrito"}
          </Button>

          <p className="mt-4 text-xs text-leather-500 text-center">
            Envíos a todo el país · Pagás cuando lo recibís
          </p>
        </motion.div>
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
