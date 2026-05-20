import { describe, it, expect } from "vitest";
import {
  cartReducer,
  initialCartState,
  type CartState,
} from "../../context/cart/cartReducer";
import { mockProduct, makeProduct } from "@/test/fixtures";
import type { CartItem } from "@/types/cart";

const itemFrom = (overrides: Partial<CartItem> = {}): CartItem => ({
  ...mockProduct,
  quantity: 1,
  ...overrides,
});

describe("cartReducer", () => {
  describe("ADD_ITEM", () => {
    it("agrega un producto nuevo con quantity 1 por defecto", () => {
      const state = cartReducer(initialCartState, {
        type: "ADD_ITEM",
        payload: { product: mockProduct },
      });

      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toMatchObject({ id: "p1", quantity: 1 });
    });

    it("respeta la quantity explícita al agregar", () => {
      const state = cartReducer(initialCartState, {
        type: "ADD_ITEM",
        payload: { product: mockProduct, quantity: 3 },
      });

      expect(state.items[0].quantity).toBe(3);
    });

    it("acumula la cantidad si el producto ya está en el carrito", () => {
      const start: CartState = { items: [itemFrom({ quantity: 2 })] };

      const state = cartReducer(start, {
        type: "ADD_ITEM",
        payload: { product: mockProduct, quantity: 3 },
      });

      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5);
    });

    it("no muta el estado original", () => {
      const start: CartState = { items: [] };
      cartReducer(start, { type: "ADD_ITEM", payload: { product: mockProduct } });
      expect(start.items).toHaveLength(0);
    });
  });

  describe("REMOVE_ITEM", () => {
    it("quita el item por id", () => {
      const start: CartState = {
        items: [itemFrom({ id: "p1" }), itemFrom({ id: "p2" })],
      };

      const state = cartReducer(start, { type: "REMOVE_ITEM", payload: "p1" });

      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe("p2");
    });

    it("no cambia nada si el id no existe", () => {
      const start: CartState = { items: [itemFrom({ id: "p1" })] };
      const state = cartReducer(start, { type: "REMOVE_ITEM", payload: "zzz" });
      expect(state.items).toHaveLength(1);
    });
  });

  describe("UPDATE_QUANTITY", () => {
    it("actualiza la cantidad del item indicado", () => {
      const start: CartState = {
        items: [itemFrom({ id: "p1", quantity: 1 }), itemFrom({ id: "p2", quantity: 1 })],
      };

      const state = cartReducer(start, {
        type: "UPDATE_QUANTITY",
        payload: { id: "p2", quantity: 7 },
      });

      expect(state.items.find((i) => i.id === "p2")?.quantity).toBe(7);
      expect(state.items.find((i) => i.id === "p1")?.quantity).toBe(1);
    });
  });

  describe("CLEAR_CART", () => {
    it("vacía el carrito devolviendo el estado inicial", () => {
      const start: CartState = { items: [itemFrom(), itemFrom({ id: "p2" })] };
      const state = cartReducer(start, { type: "CLEAR_CART" });
      expect(state).toEqual(initialCartState);
      expect(state.items).toHaveLength(0);
    });
  });

  describe("LOAD_CART", () => {
    it("reemplaza los items con el payload", () => {
      const payload = [itemFrom({ id: "p9", quantity: 4 })];
      const state = cartReducer(initialCartState, {
        type: "LOAD_CART",
        payload,
      });
      expect(state.items).toEqual(payload);
    });
  });

  it("devuelve el mismo estado ante una acción desconocida", () => {
    const start: CartState = { items: [makeProduct() as CartItem] };
    // @ts-expect-error acción inválida a propósito
    const state = cartReducer(start, { type: "NOPE" });
    expect(state).toBe(start);
  });
});
