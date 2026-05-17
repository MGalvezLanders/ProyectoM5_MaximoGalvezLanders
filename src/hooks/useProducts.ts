import { useCallback, useEffect, useState } from "react";
import {
  getProducts,
  type ProductFilters,
} from "../services/products";
import type { Product } from "../types/product";

type UseProductsResult = {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useProducts(filters: ProductFilters = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { category, search } = filters;

  const fetchProducts = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({ category, search });
        if (signal?.aborted) return;
        setProducts(data);
      } catch (err) {
        if (signal?.aborted) return;
        const message =
          err instanceof Error ? err.message : "Error al cargar productos";
        setError(message);
        setProducts([]);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [category, search],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch };
}
