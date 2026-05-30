import { AnimatePresence, motion } from "motion/react";

type CartBadgeProps = {
  count: number;
  /** Con animación spring de entrada/salida (escritorio). Sin animación = mobile. */
  animated?: boolean;
};

/**
 * Pill con la cantidad de items del carrito. Vacío cuando count === 0.
 * Single Responsibility: solo render del badge, no conoce el contexto del cart.
 */
export function CartBadge({ count, animated = false }: CartBadgeProps) {
  if (count <= 0) return null;

  const pillClass =
    "inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full bg-sun-500 text-leather-900";

  if (!animated) {
    return <span className={`ml-2 ${pillClass}`}>{count}</span>;
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.span
        key={count}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.4, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 14 }}
        className={`ml-1.5 ${pillClass}`}
      >
        {count}
      </motion.span>
    </AnimatePresence>
  );
}
