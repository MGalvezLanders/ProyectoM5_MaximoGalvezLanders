import { useContext, useMemo } from "react";
import { ProductsStateContext } from "@/context/ProductsContext";
import type { ProductFilters } from "@/services/products.service";

export function useProductsList(filters: ProductFilters = {}) {
  const ctx = useContext(ProductsStateContext);
  if (!ctx) {
    throw new Error("useProductsList debe usarse dentro de <ProductsProvider>");
  }

  const { category, search } = filters;

  const products = useMemo(() => {
    let result = ctx.state.items;
    if (category) {
      result = result.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.trim().toLowerCase();
      if (q) result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [ctx.state.items, category, search]);

  return {
    products,
    loading: ctx.state.loading,
    error: ctx.state.error,
    refetch: ctx.fetchAll,
  };
}
