import { useContext, useEffect, useState } from "react";
import { ProductsContext } from "@/context/ProductsContext";
import { getProductById } from "@/services/products";
import type { Product } from "@/types/product";

type UseProductResult = {
  product: Product | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
};

export function useProduct(id: string | undefined): UseProductResult {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProduct debe usarse dentro de <ProductsProvider>");
  }

  const cached = id ? ctx.state.items.find((p) => p.id === id) ?? null : null;

  const [fetched, setFetched] = useState<Product | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchNotFound, setFetchNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setFetched(null);
      setFetchLoading(false);
      setFetchNotFound(true);
      return;
    }
    if (cached) {
      setFetched(null);
      setFetchLoading(false);
      setFetchError(null);
      setFetchNotFound(false);
      return;
    }
    if (ctx.state.loading) {
      // esperamos a que termine la carga inicial del context
      setFetchLoading(true);
      return;
    }

    const controller = new AbortController();
    setFetchLoading(true);
    setFetchError(null);
    setFetchNotFound(false);

    getProductById(id)
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!data) {
          setFetched(null);
          setFetchNotFound(true);
        } else {
          setFetched(data);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setFetchError(
          err instanceof Error ? err.message : "Error al cargar el producto",
        );
        setFetched(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setFetchLoading(false);
      });

    return () => controller.abort();
  }, [id, cached, ctx.state.loading]);

  if (!id) {
    return { product: null, loading: false, error: null, notFound: true };
  }

  if (cached) {
    return { product: cached, loading: false, error: null, notFound: false };
  }

  return {
    product: fetched,
    loading: fetchLoading,
    error: fetchError,
    notFound: fetchNotFound,
  };
}
