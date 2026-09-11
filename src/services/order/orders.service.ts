import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../config/firebase.service";
import type { Order, OrderInput, OrderStatus } from "@/types/order";
import { canTransition } from "@/types/orderStatus";

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

export type ListOrdersResult = {
  items: Order[];
  lastDoc: DocumentSnapshot | null;
};

export const listOrders = async (
  pageSize = 30,
  cursor: DocumentSnapshot | null = null,
): Promise<ListOrdersResult> => {
  const constraints: QueryConstraint[] = [
    orderBy("orderDate", "desc"),
    limit(pageSize),
  ];
  if (cursor) constraints.push(startAfter(cursor));

  const snapshot = await getDocs(query(ordersCollection, ...constraints));
  return {
    items: snapshot.docs.map(mapDoc),
    lastDoc: snapshot.docs.at(-1) ?? null,
  };
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

//* Actualiza el estado de una orden. Si la transición es a "cancelled",
//* devuelve el stock de cada ítem al producto correspondiente en la misma
//* transacción (atómico: o se cancela y se restituye todo, o no se hace nada).
export const updateOrderStatus = async (
  id: string,
  newStatus: OrderStatus,
): Promise<void> => {
  const orderRef = doc(db, "orders", id);

  await runTransaction(db, async (tx) => {
    //* 1. READS — siempre leer ANTES de cualquier write.
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw new Error("Orden no encontrada");

    const orderData = orderSnap.data() as Omit<Order, "id">;
    const currentStatus = orderData.status;

    if (!canTransition(currentStatus, newStatus)) {
      throw new Error(
        `Transición inválida: "${currentStatus}" → "${newStatus}"`,
      );
    }

    //* Si se cancela, leemos los productos para restituir su stock.
    const restock = newStatus === "cancelled";
    const productRefs = restock
      ? orderData.items.map((item) => doc(db, "products", item.id))
      : [];
    const productSnaps = restock
      ? await Promise.all(productRefs.map((ref) => tx.get(ref)))
      : [];

    //* 2. WRITES — cambiar estado + (si aplica) devolver stock.
    tx.update(orderRef, { status: newStatus });

    if (restock) {
      productSnaps.forEach((snap, i) => {
        //* Si el producto fue eliminado del catálogo, lo saltamos: no hay
        //* dónde devolver el stock. El resto de los ítems sigue su curso.
        if (!snap.exists()) return;
        const currentStock = (snap.data().stock as number | undefined) ?? 0;
        const qty = orderData.items[i].quantity;
        tx.update(productRefs[i], { stock: currentStock + qty });
      });
    }
  });
};
