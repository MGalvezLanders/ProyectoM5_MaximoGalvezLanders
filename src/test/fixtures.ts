import type { Product } from "@/types/product";

// Timestamp de Firestore casteado: en tests no necesitamos la clase real,
// solo un objeto con la forma esperada.
const fakeTimestamp = { seconds: 0, nanoseconds: 0 } as unknown as Product["createdAt"];

export const mockProduct: Product = {
  id: "p1",
  name: "Mate Imperial",
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
  stock: 0,
};

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return { ...mockProduct, ...overrides };
}
