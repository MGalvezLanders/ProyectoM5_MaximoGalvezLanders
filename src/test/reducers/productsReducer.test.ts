import { describe, it, expect } from "vitest";
import {
  productsReducer,
  initialProductsState,
  type ProductsState,
} from "@/reducers/productsReducer";
import { mockProduct, makeProduct } from "@/test/fixtures";

describe("productsReducer", () => {
  describe("FETCH_START", () => {
    it("activa loading y limpia error", () => {
      const state = productsReducer(
        { ...initialProductsState, error: "error previo" },
        { type: "FETCH_START" },
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("no modifica los items existentes", () => {
      const start: ProductsState = { items: [mockProduct], loading: false, error: null };
      const state = productsReducer(start, { type: "FETCH_START" });
      expect(state.items).toHaveLength(1);
    });
  });

  describe("FETCH_SUCCESS", () => {
    it("reemplaza items, desactiva loading y limpia error", () => {
      const products = [mockProduct, makeProduct({ id: "p2" })];
      const state = productsReducer(
        { items: [], loading: true, error: "prev" },
        { type: "FETCH_SUCCESS", payload: products },
      );
      expect(state.items).toEqual(products);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("FETCH_ERROR", () => {
    it("desactiva loading y almacena el mensaje de error", () => {
      const state = productsReducer(
        { ...initialProductsState, loading: true },
        { type: "FETCH_ERROR", payload: "Error de red" },
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Error de red");
    });

    it("no modifica los items existentes al fallar", () => {
      const start: ProductsState = { items: [mockProduct], loading: true, error: null };
      const state = productsReducer(start, { type: "FETCH_ERROR", payload: "fail" });
      expect(state.items).toHaveLength(1);
    });
  });

  describe("ADD", () => {
    it("añade el producto al principio de la lista", () => {
      const p2 = makeProduct({ id: "p2" });
      const start: ProductsState = { items: [p2], loading: false, error: null };
      const state = productsReducer(start, { type: "ADD", payload: mockProduct });
      expect(state.items[0].id).toBe("p1");
      expect(state.items).toHaveLength(2);
    });

    it("no muta el estado original", () => {
      const start: ProductsState = { items: [], loading: false, error: null };
      productsReducer(start, { type: "ADD", payload: mockProduct });
      expect(start.items).toHaveLength(0);
    });
  });

  describe("ADD_MANY", () => {
    it("añade múltiples productos al principio conservando los existentes", () => {
      const newOnes = [makeProduct({ id: "p3" }), makeProduct({ id: "p4" })];
      const start: ProductsState = { items: [mockProduct], loading: false, error: null };
      const state = productsReducer(start, { type: "ADD_MANY", payload: newOnes });
      expect(state.items).toHaveLength(3);
      expect(state.items[0].id).toBe("p3");
    });
  });

  describe("UPDATE", () => {
    it("actualiza el producto que coincide por id", () => {
      const p2 = makeProduct({ id: "p2", name: "Nombre viejo" });
      const start: ProductsState = { items: [mockProduct, p2], loading: false, error: null };
      const updated = makeProduct({ id: "p2", name: "Nombre nuevo" });
      const state = productsReducer(start, { type: "UPDATE", payload: updated });
      expect(state.items.find((p) => p.id === "p2")?.name).toBe("Nombre nuevo");
      expect(state.items).toHaveLength(2);
    });

    it("no modifica otros items", () => {
      const start: ProductsState = {
        items: [mockProduct, makeProduct({ id: "p2" })],
        loading: false,
        error: null,
      };
      const state = productsReducer(start, {
        type: "UPDATE",
        payload: makeProduct({ id: "p2", name: "Changed" }),
      });
      expect(state.items.find((p) => p.id === "p1")?.name).toBe(mockProduct.name);
    });
  });

  describe("REMOVE", () => {
    it("elimina el producto con el id dado", () => {
      const start: ProductsState = {
        items: [mockProduct, makeProduct({ id: "p2" })],
        loading: false,
        error: null,
      };
      const state = productsReducer(start, { type: "REMOVE", payload: "p1" });
      expect(state.items).toHaveLength(1);
      expect(state.items[0].id).toBe("p2");
    });

    it("no cambia nada si el id no existe", () => {
      const start: ProductsState = { items: [mockProduct], loading: false, error: null };
      const state = productsReducer(start, { type: "REMOVE", payload: "zzz" });
      expect(state.items).toHaveLength(1);
    });
  });

  describe("RESET", () => {
    it("devuelve exactamente el estado inicial", () => {
      const start: ProductsState = { items: [mockProduct], loading: true, error: "err" };
      const state = productsReducer(start, { type: "RESET" });
      expect(state).toEqual(initialProductsState);
    });
  });

  it("devuelve el mismo estado (por referencia) ante una acción desconocida", () => {
    const start = { ...initialProductsState };
    // @ts-expect-error acción inválida a propósito
    const state = productsReducer(start, { type: "NOPE" });
    expect(state).toBe(start);
  });
});
