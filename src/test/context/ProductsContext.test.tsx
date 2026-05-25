import { describe, it, expect, vi } from "vitest";
import { type ReactNode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  ProductsProvider,
  ProductsStateContext,
} from "@/context/ProductsContext";
import { useProductsActions } from "@/hooks/products/useProductsActions";
import { useContext } from "react";
import * as productsSvc from "@/services/products.service";
import { makeProduct } from "@/test/fixtures";

const wrapper = ({ children }: { children: ReactNode }) => (
  <ProductsProvider>{children}</ProductsProvider>
);

function useProductsState() {
  return useContext(ProductsStateContext)!;
}

describe("useProductsActions — fuera del provider", () => {
  it("lanza error si se usa fuera de <ProductsProvider>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useProductsActions())).toThrow(
      /dentro de <ProductsProvider>/,
    );
    spy.mockRestore();
  });
});

describe("ProductsContext — fetchAll", () => {
  it("carga productos al montar y los pone en el estado", async () => {
    const products = [makeProduct({ id: "x1" }), makeProduct({ id: "x2" })];
    vi.mocked(productsSvc.getProducts).mockResolvedValueOnce(products);

    const { result } = renderHook(() => useProductsState(), { wrapper });

    await waitFor(() =>
      expect(result.current.state.items).toHaveLength(2),
    );
    expect(result.current.state.loading).toBe(false);
    expect(result.current.state.error).toBeNull();
  });

  it("guarda el error si getProducts falla", async () => {
    vi.mocked(productsSvc.getProducts).mockRejectedValueOnce(
      new Error("Firestore caído"),
    );

    const { result } = renderHook(() => useProductsState(), { wrapper });

    await waitFor(() =>
      expect(result.current.state.error).toBe("Firestore caído"),
    );
    expect(result.current.state.loading).toBe(false);
  });
});

describe("ProductsContext — acciones CRUD", () => {
  it("createOne agrega el producto al estado", async () => {
    const newProduct = makeProduct({ id: "new1", name: "Termo Stanley" });
    vi.mocked(productsSvc.createProduct).mockResolvedValueOnce("new1");
    vi.mocked(productsSvc.getProductById).mockResolvedValueOnce(newProduct);

    const { result } = renderHook(
      () => ({
        state: useProductsState(),
        actions: useProductsActions(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.state.state.loading).toBe(false));

    await act(async () => {
      await result.current.actions.createOne({
        name: "Termo Stanley",
        description: "",
        price: 8000,
        category: "termos",
        imageUrl: "",
        stock: 5,
      });
    });

    expect(
      result.current.state.state.items.some((p) => p.id === "new1"),
    ).toBe(true);
  });

  it("updateOne actualiza el producto en el estado", async () => {
    const original = makeProduct({ id: "u1", name: "Original" });
    const updated = { ...original, name: "Actualizado" };

    vi.mocked(productsSvc.getProducts).mockResolvedValueOnce([original]);
    vi.mocked(productsSvc.updateProduct).mockResolvedValueOnce(undefined);
    vi.mocked(productsSvc.getProductById).mockResolvedValueOnce(updated);

    const { result } = renderHook(
      () => ({
        state: useProductsState(),
        actions: useProductsActions(),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.state.state.items).toHaveLength(1),
    );

    await act(async () => {
      await result.current.actions.updateOne("u1", { name: "Actualizado" });
    });

    const found = result.current.state.state.items.find((p) => p.id === "u1");
    expect(found?.name).toBe("Actualizado");
  });

  it("removeOne elimina el producto del estado", async () => {
    const product = makeProduct({ id: "del1" });
    vi.mocked(productsSvc.getProducts).mockResolvedValueOnce([product]);
    vi.mocked(productsSvc.deleteProduct).mockResolvedValueOnce(undefined);

    const { result } = renderHook(
      () => ({
        state: useProductsState(),
        actions: useProductsActions(),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.state.state.items).toHaveLength(1),
    );

    await act(async () => {
      await result.current.actions.removeOne("del1");
    });

    expect(
      result.current.state.state.items.find((p) => p.id === "del1"),
    ).toBeUndefined();
  });

  it("bulkCreate agrega múltiples productos", async () => {
    const p1 = makeProduct({ id: "b1", name: "Mate A" });
    const p2 = makeProduct({ id: "b2", name: "Mate B" });

    vi.mocked(productsSvc.createProduct)
      .mockResolvedValueOnce("b1")
      .mockResolvedValueOnce("b2");
    vi.mocked(productsSvc.getProductById)
      .mockResolvedValueOnce(p1)
      .mockResolvedValueOnce(p2);

    const { result } = renderHook(
      () => ({
        state: useProductsState(),
        actions: useProductsActions(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.state.state.loading).toBe(false));

    let count = 0;
    await act(async () => {
      count = await result.current.actions.bulkCreate([
        { name: "Mate A", description: "", price: 1, category: "mates", imageUrl: "", stock: 1 },
        { name: "Mate B", description: "", price: 2, category: "mates", imageUrl: "", stock: 1 },
      ]);
    });

    expect(count).toBe(2);
    expect(
      result.current.state.state.items.some((p) => p.id === "b1"),
    ).toBe(true);
    expect(
      result.current.state.state.items.some((p) => p.id === "b2"),
    ).toBe(true);
  });

  it("syncStockAfterPurchase descuenta el stock del producto", async () => {
    const product = makeProduct({ id: "s1", stock: 10 });
    vi.mocked(productsSvc.getProducts).mockResolvedValueOnce([product]);

    const { result } = renderHook(
      () => ({
        state: useProductsState(),
        actions: useProductsActions(),
      }),
      { wrapper },
    );

    await waitFor(() =>
      expect(result.current.state.state.items).toHaveLength(1),
    );

    act(() => {
      result.current.actions.syncStockAfterPurchase([{ id: "s1", quantity: 3 }]);
    });

    const after = result.current.state.state.items.find((p) => p.id === "s1");
    expect(after?.stock).toBe(7);
  });

  it("syncStockAfterPurchase no falla si el id no existe", async () => {
    const { result } = renderHook(
      () => ({
        state: useProductsState(),
        actions: useProductsActions(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.state.state.loading).toBe(false));

    expect(() => {
      act(() => {
        result.current.actions.syncStockAfterPurchase([
          { id: "inexistente", quantity: 1 },
        ]);
      });
    }).not.toThrow();
  });
});
