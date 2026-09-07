import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  startAt,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../config/firebase.service";
import type { Product } from "@/types/product";

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
  imageUrls?: string[];
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
    nameLower: input.name.trim().toLowerCase(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (
  id: string,
  input: Partial<ProductInput>,
): Promise<void> => {
  const patch: Record<string, unknown> = { ...input };
  // Mantener nameLower sincronizado cuando cambia el nombre.
  if (typeof input.name === "string") {
    patch.nameLower = input.name.trim().toLowerCase();
  }
  await updateDoc(doc(db, "products", id), patch);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "products", id));
};

//* ─── Listado paginado (server-side, con cursor) ─────────────────────────────
export type ListProductsParams = {
  category?: string;
  /** Prefijo de búsqueda; se aplica sobre nameLower (mín. 2 caracteres). */
  searchPrefix?: string;
  pageSize?: number;
  cursor?: DocumentSnapshot | null;
};

export type ListProductsResult = {
  items: Product[];
  /** Último doc de la página, para usar como cursor en la siguiente llamada. */
  lastDoc: DocumentSnapshot | null;
};

/**
 * Trae una página de productos ordenados por nombre.
 *
 * Paginación por cursor: pasá el `lastDoc` de la página anterior como `cursor`
 * para traer la siguiente. La búsqueda por prefijo y el filtro por categoría se
 * resuelven en Firestore (no en cliente).
 *
 * NOTA: combinar `category` + `orderBy(nameLower)` requiere un índice compuesto.
 * La primera vez que se ejecute, la consola del navegador imprime un link para
 * crearlo con un clic.
 */
export const listProducts = async (
  params: ListProductsParams = {},
): Promise<ListProductsResult> => {
  const { category, searchPrefix, pageSize = 10, cursor = null } = params;

  const constraints: QueryConstraint[] = [];

  if (category) {
    constraints.push(where("category", "==", category));
  }

  // Ordenamos por nameLower: habilita el orden alfabético estable que necesita
  // la paginación por cursor y la búsqueda por prefijo.
  constraints.push(orderBy("nameLower"));

  const prefix = searchPrefix?.trim().toLowerCase();
  if (prefix && prefix.length >= 2) {
    const HIGH = String.fromCharCode(0xf8ff);
    constraints.push(startAt(prefix));
    constraints.push(endAt(prefix + HIGH));
  }

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(productsCollection, ...constraints));
  const items = snapshot.docs.map(mapDoc);
  const lastDoc = snapshot.docs.at(-1) ?? null;

  return { items, lastDoc };
};
