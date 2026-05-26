import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.service";
import type { CartItem } from "@/types/cart";

// Decisión de persistencia: doc top-level `carts/{uid}`.
// - Por-usuario real (sincroniza entre dispositivos), no por-dispositivo como localStorage.
// - Separado del doc de profile en `users/{uid}` para no acoplar reads de auth con carrito.
const cartDoc = (uid: string) => doc(db, "carts", uid);

export const getCart = async (uid: string): Promise<CartItem[]> => {
  const snapshot = await getDoc(cartDoc(uid));
  if (!snapshot.exists()) return [];
  const data = snapshot.data() as { items?: CartItem[] };
  return data.items ?? [];
};

export const saveCart = async (
  uid: string,
  items: CartItem[],
): Promise<void> => {
  await setDoc(cartDoc(uid), { items });
};
