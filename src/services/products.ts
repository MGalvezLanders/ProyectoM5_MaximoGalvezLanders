import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "../types/product";

export type ProductFilters = {
  category?: string;
  search?: string;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
};

const productsCollection = collection(db, "products");

const mapDoc = (snapshot: {
  id: string;
  data: () => Record<string, unknown>;
}): Product => ({
  id: snapshot.id,
  ...(snapshot.data() as Omit<Product, "id">),
});

export const getProducts = async (
  filters: ProductFilters = {},
): Promise<Product[]> => {
  const { category, search } = filters;

  const q = category
    ? query(productsCollection, where("category", "==", category))
    : query(productsCollection);

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map(mapDoc);

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : products;

  return filtered.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() ?? 0;
    const bTime = b.createdAt?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const snapshot = await getDoc(doc(db, "products", id));
  if (!snapshot.exists()) return null;
  return mapDoc(snapshot);
};

export const getCategories = async (): Promise<string[]> => {
  const snapshot = await getDocs(productsCollection);
  const categories = new Set<string>();
  for (const docSnap of snapshot.docs) {
    const category = docSnap.get("category");
    if (typeof category === "string" && category.length > 0) {
      categories.add(category);
    }
  }
  return Array.from(categories).sort();
};

export const createProduct = async (input: ProductInput): Promise<string> => {
  const ref = await addDoc(productsCollection, {
    ...input,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (
  id: string,
  input: Partial<ProductInput>,
): Promise<void> => {
  await updateDoc(doc(db, "products", id), input);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};
