import type { User as FirebaseUser } from "firebase/auth";
import type { Product } from "@/types/product";

// Timestamp de Firestore casteado: en tests no necesitamos la clase real,
// solo un objeto con la forma esperada.
const fakeTimestamp = {
  seconds: 0,
  nanoseconds: 0,
} as unknown as Product["createdAt"];

export const mockFirebaseUser = {
  uid: "test-uid",
  email: "test@example.com",
  displayName: "Test User",
} as unknown as FirebaseUser;

export const mockProduct: Product = {
  id: "p1",
  name: "Mate Imperial",
  nameLower: "mate imperial",
  description: "Mate de calabaza forrado en cuero",
  price: 15000,
  category: "mates",
  imageUrl: "https://example.com/mate.jpg",
  stock: 10,
  createdAt: fakeTimestamp,
};

export const mockProductOutOfStock: Product = {
  ...mockProduct,
  id: "p2",
  name: "Bombilla Alpaca",
  nameLower: "bombilla alpaca",
  stock: 0,
};

export function makeProduct(overrides: Partial<Product> = {}): Product {
  const merged = { ...mockProduct, ...overrides };
  // Si el override cambió `name` pero no `nameLower`, lo derivamos para
  // mantener consistencia con el shape real que persiste a Firestore.
  if (overrides.name && !overrides.nameLower) {
    merged.nameLower = overrides.name.toLowerCase();
  }
  return merged;
}
