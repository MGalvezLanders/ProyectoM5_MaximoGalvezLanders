import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/product/Card";
import { Button } from "@/components/button/Button";
import { QuantityInput } from "@/components/ui/QuantityInput";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { useCart } from "@/hooks/cart/useCart";
import { BackButton } from "@/components/button/BackButton";
import { fadeUp, stagger } from "@/utils/animations";
import { formatPrice } from "@/utils/formatting";

export default function CartPage() {
  const { state, updateQuantity, removeItem, clear, error } = useCart();
  const navigate = useNavigate();
  const { items } = state;

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

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
          className="lg:sticky lg:top-24 lg:self-start"
        >
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
    </Container>
  );
}
