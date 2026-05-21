import { useContext, useMemo } from "react";
import { ProductsContext } from "@/context/ProductsContext";
import type { ProductFilters } from "@/services/products";

export function useProducts(filters: ProductFilters = {}) {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProducts debe usarse dentro de <ProductsProvider>");
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
    createOne: ctx.createOne,
    updateOne: ctx.updateOne,
    removeOne: ctx.removeOne,
    bulkCreate: ctx.bulkCreate,
    dispatch: ctx.dispatch,
  };
}
