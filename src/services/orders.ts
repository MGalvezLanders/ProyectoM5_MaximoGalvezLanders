import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Order, OrderStatus } from "../types/order";

const ordersCollection = collection(db, "orders");

const mapDoc = (snapshot: {
  id: string;
  data: () => Record<string, unknown>;
}): Order => ({
  id: snapshot.id,
  ...(snapshot.data() as Omit<Order, "id">),
});

export const getAllOrders = async (): Promise<Order[]> => {
  const snapshot = await getDocs(ordersCollection);
  return snapshot.docs
    .map(mapDoc)
    .sort((a, b) => {
      const aTime = a.orderDate instanceof Date ? a.orderDate.getTime() : 0;
      const bTime = b.orderDate instanceof Date ? b.orderDate.getTime() : 0;
      return bTime - aTime;
    });
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(ordersCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapDoc);
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const snapshot = await getDoc(doc(db, "orders", id));
  if (!snapshot.exists()) return null;
  return mapDoc(snapshot);
};

export const updateOrderStatus = async (
  id: string,
  status: OrderStatus,
): Promise<void> => {
  await updateDoc(doc(db, "orders", id), { status });
};
