import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/product/Card";
import { Button } from "@/components/button/Button";
import { QuantityInput } from "@/components/ui/QuantityInput";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { useCart } from "@/hooks/cart/useCart";
import { useBestSellers } from "@/hooks/products/useBestSellers";
import { BackButton } from "@/components/button/BackButton";
import { RecentlyViewed } from "@/components/product/RecentlyViewed";
import { fadeUp, stagger } from "@/utils/animations";
import { formatPrice } from "@/utils/formatting";

const FREE_SHIPPING_THRESHOLD = 30_000;

export default function CartPage() {
  const { state, updateQuantity, removeItem, clear, error } = useCart();
  const { products: bestSellers } = useBestSellers();
  const navigate = useNavigate();
  const { items } = state;

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  const cartIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);
  const recommendations = useMemo(
    () => bestSellers.filter((p) => !cartIds.has(p.id)).slice(0, 4),
    [bestSellers, cartIds],
  );

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const freeShippingUnlocked = total >= FREE_SHIPPING_THRESHOLD;
  const progressPct = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <Container size="md" className="py-16">
        <motion.div
          className="text-center max-w-md mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUp}
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ rotate: { duration: 1.2, delay: 0.4, ease: "easeInOut" } }}
            className="w-fit mx-auto mb-4"
          >
            <SolDeMayo className="w-16 h-16 opacity-70" />
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="font-display text-3xl font-bold text-leather-900 mb-2"
          >
            Tu carrito está vacío
          </motion.h1>
          <motion.p variants={fadeUp} className="text-leather-700 mb-6">
            Todavía no agregaste productos. Date una vuelta por el catálogo.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link to="/catalog">
              <Button>Ir al catálogo</Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-12">
      <BackButton variant="back" className="mb-4">
        Seguir comprando
      </BackButton>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={fadeUp}
          className="font-display text-3xl font-bold text-leather-900 mb-2"
        >
          Tu carrito
        </motion.h1>
        <motion.p variants={fadeUp} className="text-sm text-leather-600 mb-6">
          {totalUnits} {totalUnits === 1 ? "producto" : "productos"} en total
        </motion.p>
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-sm text-terracota-500 bg-terracota-50 border border-terracota-200 rounded-lg px-3 py-2"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.22 } }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card padded={false} className="p-4">
                  <div className="flex gap-4">
                    <Link
                      to={`/products/${item.id}`}
                      className="block w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-cream-100 rounded-lg overflow-hidden border border-sepia-300"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="min-w-0">
                          <Link
                            to={`/products/${item.id}`}
                            className="block font-display text-lg font-semibold text-leather-900 hover:text-leather-700 line-clamp-2 leading-tight"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-leather-500 capitalize mt-0.5">
                            {item.category}
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeItem(item.id)}
                          aria-label={`Quitar ${item.name} del carrito`}
                          className="text-sm text-leather-500 hover:text-terracota-500 transition-colors flex-shrink-0"
                        >
                          Quitar
                        </motion.button>
                      </div>

                      <div className="flex items-end justify-between gap-3 mt-auto">
                        <QuantityInput
                          value={item.quantity}
                          onChange={(q) => updateQuantity(item.id, q)}
                          min={1}
                          max={item.stock}
                        />
                        <div className="text-right">
                          <p className="text-xs text-leather-500">
                            {formatPrice(item.price)} c/u
                          </p>
                          <p className="font-display text-lg font-bold text-leather-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-24 lg:self-start space-y-3"
        >
          {/* Barra de progreso envío gratis */}
          <div className="bg-cream-50 border border-sepia-300 rounded-xl p-4">
            {freeShippingUnlocked ? (
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-field-500/15 text-field-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-leather-900">¡Envío gratis desbloqueado!</p>
                  <p className="text-xs text-leather-600 mt-0.5">Te lo mandamos sin cargo a cualquier provincia.</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-leather-700 mb-2">
                  Sumá <span className="font-display font-bold text-leather-900">{formatPrice(remaining)}</span> más y{" "}
                  <span className="font-semibold text-field-600">el envío es gratis</span>.
                </p>
                <div className="h-1.5 bg-sepia-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-sun-500 to-field-500 rounded-full"
                  />
                </div>
              </>
            )}
          </div>

          <Card>
            <h2 className="font-display text-xl font-bold text-leather-900 mb-4">
              Resumen
            </h2>
            <dl className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <dt className="text-leather-700">Productos</dt>
                <dd className="font-medium text-leather-900">{totalUnits}</dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-sepia-300">
                <dt className="text-leather-900 font-display text-base font-bold">
                  Total
                </dt>
                <motion.dd
                  key={total}
                  initial={{ scale: 1.08, color: "var(--color-sun-600)" }}
                  animate={{ scale: 1, color: "var(--color-leather-900)" }}
                  transition={{ duration: 0.3 }}
                  className="font-display text-xl font-bold"
                >
                  {formatPrice(total)}
                </motion.dd>
              </div>
            </dl>
            <Button fullWidth onClick={() => navigate("/checkout")}>
              Finalizar compra
            </Button>
            <button
              type="button"
              onClick={clear}
              className="w-full mt-3 text-sm text-leather-500 hover:text-terracota-500 transition-colors"
            >
              Vaciar carrito
            </button>
          </Card>
        </motion.aside>
      </div>

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-bold text-leather-900">
              También te puede interesar
            </h2>
            <Link to="/catalog" className="text-sm text-leather-600 hover:text-leather-900 underline underline-offset-2 shrink-0">
              Ver más
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {recommendations.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="group block bg-cream-50 border border-sepia-300 rounded-lg overflow-hidden hover:shadow-warm-sm hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-square bg-cream-100 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-leather-800 line-clamp-1 leading-tight">
                    {p.name}
                  </p>
                  <p className="text-sm font-display font-bold text-leather-900 mt-1">
                    {formatPrice(p.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Vistos recientemente */}
      <div className="mt-14">
        <RecentlyViewed />
      </div>
    </Container>
  );
}
