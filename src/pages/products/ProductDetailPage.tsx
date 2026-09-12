import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
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
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatPrice } from "@/utils/formatting";
import { getStockBadge } from "@/utils/order/stockBadge";
import type { Product } from "@/types/product";
import { RelatedProductsCarousel } from "@/components/product/RelatedProductsCarousel";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { StarRating } from "@/components/ui/StarRating";
import { getProductRating, getProductReviews } from "@/utils/reviews";
import { fadeLeft, fadeRight } from "@/utils/animations";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, notFound } = useProduct(id);
  useRecentlyViewed(product?.id);

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
        <>
          <div className="border-t border-sepia-300">
            <Container size="xl" className="py-10">
              <RelatedProductsCarousel
                currentId={product.id}
                category={product.category}
              />
            </Container>
          </div>
          <div className="border-t border-sepia-300 bg-cream-100/40">
            <Container size="xl" className="py-10">
              <RecentlyViewed excludeId={product.id} />
            </Container>
          </div>
        </>
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

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const CARE_TIPS: Record<string, string[]> = {
  mates:     ["Curar antes del primer uso con yerba húmeda 24hs", "Evitar detergente — enjuagar con agua tibia", "Secar boca abajo, no exponer al sol directo"],
  materas:   ["Limpiar con paño apenas húmedo", "Aplicar grasa vacuna 1-2 veces al año", "Guardar en lugar seco, lejos de humedad"],
  termos:    ["Enjuagar con agua caliente antes del primer uso", "No usar en microondas", "Lavar solo el exterior con paño húmedo"],
  ponchos:   ["Lavar a mano con agua fría", "Secar a la sombra, sin escurrir", "Guardar plegado, no colgado"],
  sombreros: ["Cepillar en seco con cepillo suave", "Evitar humedad prolongada", "Guardar en horma o caja para conservar la forma"],
  boinas:    ["Cepillar en seco", "Lavar solo si es imprescindible, en agua fría", "Secar sobre superficie plana"],
};

function getDetailsFor(product: Product): { origin: string; care: string[] } {
  const group = product.category.toLowerCase();
  const key = Object.keys(CARE_TIPS).find((k) => group.includes(k.slice(0, -1))) ?? "mates";
  return {
    origin: "Taller artesanal en el norte argentino",
    care: CARE_TIPS[key] ?? CARE_TIPS.mates,
  };
}

function DetailsAccordion({ product }: { product: Product }) {
  const [open, setOpen] = useState<"details" | "care" | "shipping" | null>("details");
  const details = getDetailsFor(product);

  const rows: { id: "details" | "care" | "shipping"; label: string; content: React.ReactNode }[] = [
    {
      id: "details",
      label: "Detalles del producto",
      content: (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-leather-500 text-xs uppercase tracking-wide">Categoría</dt>
            <dd className="text-leather-900 capitalize font-medium">{product.category}</dd>
          </div>
          <div>
            <dt className="text-leather-500 text-xs uppercase tracking-wide">Origen</dt>
            <dd className="text-leather-900 font-medium">{details.origin}</dd>
          </div>
          <div>
            <dt className="text-leather-500 text-xs uppercase tracking-wide">Stock disponible</dt>
            <dd className="text-leather-900 font-medium">
              {product.stock} unidad{product.stock === 1 ? "" : "es"}
            </dd>
          </div>
          <div>
            <dt className="text-leather-500 text-xs uppercase tracking-wide">Elaboración</dt>
            <dd className="text-leather-900 font-medium">Hecho a mano, pieza única</dd>
          </div>
        </dl>
      ),
    },
    {
      id: "care",
      label: "Cuidados y mantenimiento",
      content: (
        <ul className="space-y-2 text-sm text-leather-800">
          {details.care.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="text-sun-500 mt-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "shipping",
      label: "Envíos y devoluciones",
      content: (
        <ul className="space-y-2 text-sm text-leather-800">
          <li className="flex gap-2"><span className="text-sun-500 mt-1">•</span> Envío a todo el país en 24-48hs desde el taller.</li>
          <li className="flex gap-2"><span className="text-sun-500 mt-1">•</span> Tracking incluido en todos los pedidos.</li>
          <li className="flex gap-2"><span className="text-sun-500 mt-1">•</span> Devolución sin cargo durante 30 días.</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="mt-8 border-t border-sepia-300">
      {rows.map((row) => {
        const isOpen = open === row.id;
        return (
          <div key={row.id} className="border-b border-sepia-300">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : row.id)}
              aria-expanded={isOpen}
              className="w-full py-4 flex items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50 rounded-lg"
            >
              <span className="font-display font-semibold text-leather-900">{row.label}</span>
              <svg
                className={`w-4 h-4 text-leather-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100 pb-4" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">{row.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReviewsSection({ product }: { product: Product }) {
  const rating = getProductRating(product.id);
  const reviews = getProductReviews(product.id);

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    // Curva sintética: la mayoría entre 4-5, poca cola.
    const weights = { 5: 0.68, 4: 0.22, 3: 0.06, 2: 0.02, 1: 0.02 } as const;
    const w = weights[star as 1 | 2 | 3 | 4 | 5];
    const pct = Math.round(w * 100);
    const n = Math.round(rating.count * w);
    return { star, pct, n };
  });

  return (
    <section id="reviews" className="mt-14 pt-10 border-t border-sepia-300 scroll-mt-24">
      <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_1fr] items-start">
        {/* Resumen */}
        <div className="bg-cream-50 border border-sepia-300 rounded-2xl p-5">
          <h2 className="font-display text-xl font-bold text-leather-900 mb-3">
            Reseñas de clientes
          </h2>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-4xl font-bold text-leather-900 leading-none">
              {rating.average.toFixed(1)}
            </span>
            <span className="text-sm text-leather-500">/ 5</span>
          </div>
          <StarRating value={rating.average} size={16} />
          <p className="text-xs text-leather-500 mt-2 mb-4">
            Basado en {rating.count} reseñas
          </p>

          <ul className="space-y-1.5">
            {distribution.map((d) => (
              <li key={d.star} className="flex items-center gap-2 text-xs">
                <span className="w-4 shrink-0 text-leather-500 tabular-nums">{d.star}</span>
                <svg className="w-3 h-3 text-sun-500 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 1.5l2.6 5.4 6 .8-4.3 4.2 1 5.9L10 15l-5.3 2.8 1-5.9L1.4 7.7l6-.8L10 1.5z" />
                </svg>
                <div className="flex-1 h-1.5 bg-sepia-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sun-500 rounded-full"
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-leather-500 tabular-nums">{d.n}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lista de reviews */}
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <article
              key={i}
              className="bg-cream-50 border border-sepia-300 rounded-xl p-5"
            >
              <header className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <p className="font-display font-semibold text-leather-900 text-sm">
                    {r.author}{" "}
                    <span className="font-normal text-leather-500 text-xs">
                      · {r.location}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={r.rating} size={12} />
                    <span className="text-[11px] text-leather-500">{r.date}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-field-600 bg-field-500/10 px-2 py-0.5 rounded-full shrink-0">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Compra verificada
                </span>
              </header>
              <h4 className="font-display font-semibold text-leather-900 mb-1">
                {r.title}
              </h4>
              <p className="text-sm text-leather-700 leading-relaxed">
                {r.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lightbox({
  images, index, onClose, onPrev, onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const hasMultiple = images.length > 1;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasMultiple) onPrev();
      if (e.key === "ArrowRight" && hasMultiple) onNext();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose, onPrev, onNext, hasMultiple]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-leather-900/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-cream-50/10 hover:bg-cream-50/20 text-cream-50 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/70"
      >
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            aria-label="Foto anterior"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-cream-50/10 hover:bg-cream-50/20 text-cream-50 flex items-center justify-center transition-colors"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            aria-label="Foto siguiente"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-cream-50/10 hover:bg-cream-50/20 text-cream-50 flex items-center justify-center transition-colors"
          >
            <ChevronRightIcon />
          </button>
        </>
      )}

      <motion.img
        key={index}
        src={images[index]}
        alt=""
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[92vw] max-h-[86vh] object-contain rounded-lg cursor-zoom-out"
      />

      {hasMultiple && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-leather-900/60 text-cream-50 text-xs font-medium px-3 py-1 rounded-full">
          {index + 1} / {images.length}
        </span>
      )}
    </motion.div>
  );
}

function ProductDetailContent({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addToCart, justAdded } = useAddToCart();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(product.id);
  const stockBadge = getStockBadge(product.stock);
  const outOfStock = product.stock === 0;

  const images =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [product.imageUrl];
  const hasMultiple = images.length > 1;

  const goToPrev = () =>
    setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
  const goToNext = () =>
    setCurrentImageIndex((i) => (i + 1) % images.length);

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
          className="flex flex-col gap-3"
        >
          {/* Imagen principal */}
          <div className="relative bg-cream-100 border border-sepia-300 rounded-2xl overflow-hidden shadow-warm group">
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label="Ampliar imagen"
              className="block w-full aspect-square cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60"
            >
              <img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${product.name}${hasMultiple ? ` — foto ${currentImageIndex + 1}` : ""}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>

            {/* Hint de zoom */}
            <span className="absolute top-3 left-3 bg-leather-900/70 text-cream-50 text-[10px] font-medium px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none inline-flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.25" />
                <path d="M13 13l-3.5-3.5M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
              Click para ampliar
            </span>

            {hasMultiple && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-cream-50/85 backdrop-blur-sm border border-sepia-300 rounded-full w-10 h-10 flex items-center justify-center text-leather-700 hover:bg-cream-200 hover:text-leather-900 transition-colors shadow-sm"
                  aria-label="Foto anterior"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-cream-50/85 backdrop-blur-sm border border-sepia-300 rounded-full w-10 h-10 flex items-center justify-center text-leather-700 hover:bg-cream-200 hover:text-leather-900 transition-colors shadow-sm"
                  aria-label="Foto siguiente"
                >
                  <ChevronRightIcon />
                </button>

                <div className="absolute bottom-3 right-3 bg-leather-900/55 text-cream-50 text-xs font-medium px-2.5 py-1 rounded-full select-none">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Miniaturas */}
          {hasMultiple && (
            <div className="flex gap-2 justify-center flex-wrap">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60 focus-visible:ring-offset-1 focus-visible:ring-offset-cream-50 ${
                    i === currentImageIndex
                      ? "border-leather-700 shadow-md scale-105"
                      : "border-sepia-300 opacity-55 hover:opacity-90 hover:border-sepia-500"
                  }`}
                >
                  <img
                    src={url}
                    alt={`Miniatura ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
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

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-leather-900 mb-2 leading-tight">
            {product.name}
          </h1>

          <a
            href="#reviews"
            className="inline-flex items-center gap-2 mb-3 text-sm text-leather-600 hover:text-leather-900 transition-colors group"
          >
            <StarRating value={getProductRating(product.id).average} size={14} />
            <span className="font-medium text-leather-900">
              {getProductRating(product.id).average.toFixed(1)}
            </span>
            <span className="text-leather-500 group-hover:underline">
              ({getProductRating(product.id).count} reseñas)
            </span>
          </a>

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

          <div className="flex items-stretch gap-2">
            <Button
              size="lg"
              disabled={outOfStock || justAdded}
              onClick={handleAddToCart}
              className="flex-1"
            >
              {outOfStock
                ? "Sin stock"
                : justAdded
                  ? "✓ Agregado al carrito"
                  : "Agregar al carrito"}
            </Button>
            <button
              type="button"
              onClick={() => toggle(product.id)}
              aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
              aria-pressed={fav}
              className={[
                "shrink-0 w-14 rounded-lg border flex items-center justify-center transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
                fav
                  ? "border-terracota-500 bg-terracota-500/10 text-terracota-500"
                  : "border-sepia-400 bg-cream-50 text-leather-600 hover:border-leather-500 hover:text-leather-900",
              ].join(" ")}
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 20 20"
                fill={fav ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 17s-6-3.5-6-8a3.5 3.5 0 016-2.5A3.5 3.5 0 0116 9c0 4.5-6 8-6 8z" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-xs text-leather-500 text-center">
            Envíos a todo el país · Pagás cuando lo recibís
          </p>

          <DetailsAccordion product={product} />
        </motion.div>
      </div>

      <ReviewsSection product={product} />


      {/* Sticky mobile add-to-cart */}
      {!outOfStock && (
        <>
          <div className="md:hidden h-20" aria-hidden="true" />
          <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream-50/95 backdrop-blur border-t border-sepia-300 px-4 py-3 shadow-warm-lg">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[10px] text-leather-500 leading-tight uppercase tracking-wide">Total</p>
                <p className="font-display text-lg font-bold text-leather-900 leading-tight">
                  {formatPrice(product.price * quantity)}
                </p>
              </div>
              <Button
                size="md"
                disabled={justAdded}
                onClick={handleAddToCart}
                className="flex-1"
              >
                {justAdded ? "✓ Agregado" : "Agregar al carrito"}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={images}
            index={currentImageIndex}
            onClose={() => setLightboxOpen(false)}
            onPrev={goToPrev}
            onNext={goToNext}
          />
        )}
      </AnimatePresence>
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
