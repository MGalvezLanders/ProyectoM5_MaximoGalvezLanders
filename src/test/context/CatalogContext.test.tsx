import { describe, it, expect, vi } from "vitest";
import { type ReactNode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { CatalogProvider, useCatalog } from "@/context/CatalogContext";
import { listProducts } from "@/services/products.service";
import { makeProduct } from "@/test/fixtures";

const wrapper = ({ children }: { children: ReactNode }) => (
  <CatalogProvider>{children}</CatalogProvider>
);

describe("useCatalog", () => {
  it("lanza error si se usa fuera de <CatalogProvider>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCatalog())).toThrow(
      /dentro de <CatalogProvider>/,
    );
    spy.mockRestore();
  });
});

describe("CatalogContext", () => {
  it("arranca con el estado inicial vacío", () => {
    const { result } = renderHook(() => useCatalog(), { wrapper });
    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);
  });

  it("loadFirstPage llama a listProducts con los filtros y actualiza el estado", async () => {
    const products = [makeProduct({ id: "a" }), makeProduct({ id: "b" })];
    vi.mocked(listProducts).mockResolvedValueOnce({
      items: products,
      lastDoc: null,
    });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadFirstPage({ category: "mates" });
    });

    expect(listProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: "mates", pageSize: 10 }),
    );
    expect(result.current.products).toEqual(products);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("loadFirstPage detecta hasMore=true cuando recibe una página completa", async () => {
    const products = Array.from({ length: 10 }, (_, i) =>
      makeProduct({ id: `p${i}` }),
    );
    vi.mocked(listProducts).mockResolvedValueOnce({
      items: products,
      lastDoc: { id: "last" } as never,
    });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadFirstPage({});
    });

    expect(result.current.hasMore).toBe(true);
  });

  it("loadFirstPage detecta hasMore=false cuando la página está incompleta", async () => {
    vi.mocked(listProducts).mockResolvedValueOnce({
      items: [makeProduct()],
      lastDoc: null,
    });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadFirstPage({});
    });

    expect(result.current.hasMore).toBe(false);
  });

  it("loadFirstPage guarda el error si listProducts falla", async () => {
    vi.mocked(listProducts).mockRejectedValueOnce(new Error("Sin conexión"));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadFirstPage({});
    });

    expect(result.current.error).toBe("Sin conexión");
    expect(result.current.loading).toBe(false);
  });

  it("loadMore no hace nada si no hay cursor (sin página previa)", async () => {
    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadMore();
    });

    // listProducts mockeado a [] en setup; no se llama de nuevo en loadMore sin cursor
    expect(result.current.loadingMore).toBe(false);
  });

  it("loadMore acumula productos y actualiza el cursor", async () => {
    const page1 = Array.from({ length: 10 }, (_, i) =>
      makeProduct({ id: `p${i}` }),
    );
    const page2 = [makeProduct({ id: "extra" })];

    vi.mocked(listProducts)
      .mockResolvedValueOnce({ items: page1, lastDoc: { id: "cur" } as never })
      .mockResolvedValueOnce({ items: page2, lastDoc: null });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadFirstPage({});
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.products).toHaveLength(11);
    expect(result.current.hasMore).toBe(false);
  });

  it("loadMore guarda el error si falla la segunda página", async () => {
    const page1 = Array.from({ length: 10 }, (_, i) =>
      makeProduct({ id: `p${i}` }),
    );
    vi.mocked(listProducts)
      .mockResolvedValueOnce({ items: page1, lastDoc: { id: "cur" } as never })
      .mockRejectedValueOnce(new Error("Timeout"));

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadFirstPage({});
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe("Timeout");
    expect(result.current.loadingMore).toBe(false);
  });

  it("reset vuelve al estado inicial", async () => {
    vi.mocked(listProducts).mockResolvedValueOnce({
      items: [makeProduct()],
      lastDoc: null,
    });

    const { result } = renderHook(() => useCatalog(), { wrapper });

    await act(async () => {
      await result.current.loadFirstPage({});
    });

    await waitFor(() => expect(result.current.products).toHaveLength(1));

    act(() => {
      result.current.reset();
    });

    expect(result.current.products).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);
  });
});
