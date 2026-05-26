import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  cartReducer,
  initialCartState,
  type CartState,
} from "@/reducers/cartReducer";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreError } from "@/hooks/errors/useFirestoreError";
import { getCart, saveCart } from "@/services/cart/cart.service";
import type { Product } from "@/types/product";

type CartContextType = {
  state: CartState;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  error: string | null;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const { error, captureError, clearError } = useFirestoreError();
  const isHydratedRef = useRef(false);

  useEffect(() => {
    isHydratedRef.current = false;
    if (!user) {
      dispatch({ type: "CLEAR_CART" });
      isHydratedRef.current = true;
      return;
    }
    let cancelled = false;
    getCart(user.uid)
      .then((items) => {
        if (cancelled) return;
        dispatch({ type: "LOAD_CART", payload: items });
        clearError();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[CartContext] Error cargando carrito:", err);
        captureError(err);
      })
      .finally(() => {
        if (!cancelled) isHydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [user, captureError, clearError]);

  useEffect(() => {
    if (!isHydratedRef.current || !user) return;
    saveCart(user.uid, state.items).catch((err) => {
      console.error("[CartContext] Error guardando carrito:", err);
      captureError(err);
    });
  }, [state.items, user, captureError]);

  const addItem = useCallback((product: Product, quantity?: number) => {
    dispatch({ type: "ADD_ITEM", payload: { product, quantity } });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  return (
    <CartContext.Provider
      value={{ state, addItem, removeItem, updateQuantity, clear, error }}
    >
      {children}
    </CartContext.Provider>
  );
}
