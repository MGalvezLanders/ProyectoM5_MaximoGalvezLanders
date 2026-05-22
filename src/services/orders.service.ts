import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase.service";
import type { Order, OrderInput, OrderStatus } from "../types/order";
import { canTransition } from "../types/orderStatus";

const ordersCollection = collection(db, "orders");

const mapDoc = (snapshot: {
  id: string;
  data: () => Record<string, unknown>;
}): Order => ({
  id: snapshot.id,
  ...(snapshot.data() as Omit<Order, "id">),
});

//* Crea la orden y decrementa el stock de cada producto en una sola transacción.
//* Si algún producto no existe o no tiene stock suficiente, la operación entera
//* se aborta y no se persiste ningún cambio (atomicidad).
export const createOrder = async (input: OrderInput): Promise<string> => {
  if (input.items.length === 0) {
    throw new Error("El carrito está vacío");
  }

  //* Pre-generamos el ID para devolverlo después del commit.
  const orderRef = doc(ordersCollection);

  await runTransaction(db, async (tx) => {
    const productRefs = input.items.map((item) => doc(db, "products", item.id));

    //* 1. READS — Firestore exige leer todo ANTES de cualquier write.
    const productSnaps = await Promise.all(
      productRefs.map((ref) => tx.get(ref)),
    );

    //* 2. VALIDACIÓN — stock suficiente en cada producto.
    const stockUpdates: number[] = [];
    productSnaps.forEach((snap, i) => {
      const item = input.items[i];
      if (!snap.exists()) {
        throw new Error(`El producto "${item.name}" ya no está disponible`);
      }
      const currentStock = (snap.data().stock as number | undefined) ?? 0;
      if (currentStock < item.quantity) {
        throw new Error(
          `Stock insuficiente para "${item.name}": disponible ${currentStock}, solicitado ${item.quantity}`,
        );
      }
      stockUpdates.push(currentStock - item.quantity);
    });

    //* 3. WRITES — crear orden + decrementar stock.
    tx.set(orderRef, {
      ...input,
      status: "pending" as OrderStatus,
      orderDate: serverTimestamp(),
    });

    productRefs.forEach((ref, i) => {
      tx.update(ref, { stock: stockUpdates[i] });
    });
  });

  return orderRef.id;
};

export const getAllOrders = async (): Promise<Order[]> => {
  const snapshot = await getDocs(ordersCollection);
  return snapshot.docs.map(mapDoc).sort((a, b) => {
    const aTime = a.orderDate?.toMillis?.() ?? 0;
    const bTime = b.orderDate?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(ordersCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapDoc).sort((a, b) => {
    const aTime = a.orderDate?.toMillis?.() ?? 0;
    const bTime = b.orderDate?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const snapshot = await getDoc(doc(db, "orders", id));
  if (!snapshot.exists()) return null;
  return mapDoc(snapshot);
};

export const updateOrderStatus = async (
  id: string,
  newStatus: OrderStatus,
): Promise<void> => {
  const snap = await getDoc(doc(db, "orders", id));
  if (!snap.exists()) throw new Error("Orden no encontrada");
  const currentStatus = (snap.data() as Order).status;
  if (!canTransition(currentStatus, newStatus)) {
    throw new Error(`Transición inválida: "${currentStatus}" → "${newStatus}"`);
  }
  await updateDoc(doc(db, "orders", id), { status: newStatus });
};
