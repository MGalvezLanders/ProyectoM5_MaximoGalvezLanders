import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/button/Button";
import { useCart } from "@/hooks/cart/useCart";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { formatPrice } from "@/utils/formatting";

/**
 * Panel lateral (slide-in desde la izquierda) que muestra el carrito completo
 * cada vez que el usuario agrega un producto. Resalta el ítem recién sumado y
 * ofrece tres acciones: cerrar, seguir navegando o ir al carrito.
 */
export function CartDrawer() {
  const {
    state,
    drawerOpen,
    closeDrawer,
    highlightedItemId,
    removeItem,
  } = useCart();
  const navigate = useNavigate();

  //* Bloqueo de scroll del body mientras está abierto.
  useBodyScrollLock(drawerOpen);

  //* Escape cierra el drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [drawerOpen, closeDrawer]);

  const items = state.items;
  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleGoToCart = () => {
    closeDrawer();
    navigate("/cart");
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop oscuro */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-leather-900/55 z-40"
            aria-hidden="true"
          />

          {/* Panel desde la izquierda */}
          <motion.aside
            key="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Resumen del carrito"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-md bg-cream-50 border-r border-sepia-300 shadow-2xl shadow-leather-900/40 flex flex-col"
          >
            {/* Banda patria decorativa */}
            <div className="absolute top-0 left-0 right-0 h-1 band-argentina" />

            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b border-sepia-300 bg-cream-100 pt-5">
              <div>
                <h2 className="font-display text-xl font-bold text-leather-900 leading-tight">
                  Tu carrito
                </h2>
                <p className="text-xs text-leather-600">
                  {itemCount} producto{itemCount === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Cerrar carrito"
                className="w-9 h-9 rounded-full flex items-center justify-center text-leather-700 hover:bg-sepia-300/60 hover:text-leather-900 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>

            {/* Contenido */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-3">
                <p className="font-display text-lg font-semibold text-leather-900">
                  Tu carrito está vacío
                </p>
                <p className="text-sm text-leather-600 max-w-xs">
                  Agregá productos del catálogo para verlos acá.
                </p>
                <Link to="/catalog" onClick={closeDrawer} className="mt-2">
                  <Button>Ver catálogo</Button>
                </Link>
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-sepia-300/60">
                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const isHighlighted = item.id === highlightedItemId;
                    return (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -16 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          backgroundColor: isHighlighted
                            ? "rgba(244, 197, 110, 0.18)"
                            : "rgba(244, 197, 110, 0)",
                        }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className={[
                          "flex gap-3 p-4 relative",
                          isHighlighted
                            ? "ring-1 ring-inset ring-sun-500"
                            : "",
                        ].join(" ")}
                      >
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-sepia-300 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${item.id}`}
                            onClick={closeDrawer}
                            className="block font-medium text-leather-900 truncate hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-leather-600 mt-0.5">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                          {isHighlighted && (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold text-sun-600">
                              ✓ Recién agregado
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-between flex-shrink-0">
                          <span className="font-display font-semibold text-leather-900 tabular-nums">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Quitar ${item.name}`}
                            className="text-xs text-terracota-500 hover:underline mt-1"
                          >
                            Quitar
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}

            {/* Footer con subtotal + acciones */}
            {items.length > 0 && (
              <footer className="border-t border-sepia-300 px-5 py-4 bg-cream-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase tracking-wider font-medium text-leather-600">
                    Subtotal
                  </span>
                  <motion.span
                    key={total}
                    initial={{ scale: 1.08, color: "var(--color-sun-600)" }}
                    animate={{ scale: 1, color: "var(--color-leather-900)" }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-2xl font-bold tabular-nums"
                  >
                    {formatPrice(total)}
                  </motion.span>
                </div>
                <p className="text-xs text-leather-500">
                  Envío e impuestos se calculan en el checkout.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={closeDrawer} fullWidth>
                    Seguir navegando
                  </Button>
                  <Button onClick={handleGoToCart} fullWidth>
                    Ir al carrito
                  </Button>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
