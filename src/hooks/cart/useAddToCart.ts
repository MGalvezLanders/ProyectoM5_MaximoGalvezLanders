import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/cart/useCart";
import type { Product } from "@/types/product";

const JUST_ADDED_MS = 1500;

type UseAddToCartResult = {
  /** Dispara el agregado: chequea auth, hace toast si no está logueado, agrega y marca `justAdded`. */
  addToCart: (product: Product, quantity?: number) => void;
  /** True durante ~1.5s después de agregar — útil para feedback en el botón. */
  justAdded: boolean;
};

/**
 * Encapsula el flujo de "agregar al carrito" que estaba duplicado en
 * ProductCard y ProductDetailPage:
 *   1. Si no hay usuario → toast y abortar.
 *   2. Llamar a addItem (que dispara también el CartDrawer).
 *   3. Marcar justAdded = true por 1.5s.
 *
 * Single Responsibility: la UI solo se ocupa del render; toda la lógica
 * de gate + feedback queda acá.
 */
export function useAddToCart(): UseAddToCartResult {
  const { user } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  //* Limpieza para no setear estado luego de desmontar.
  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const addToCart = useCallback(
    (product: Product, quantity?: number) => {
      if (!user) {
        toast.warning("Debes iniciar sesión para agregar al carrito", {
          action: {
            label: "Iniciar sesión",
            onClick: () => navigate("/login"),
          },
        });
        return;
      }
      addItem(product, quantity);
      setJustAdded(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(
        () => setJustAdded(false),
        JUST_ADDED_MS,
      );
    },
    [user, addItem, navigate],
  );

  return { addToCart, justAdded };
}
