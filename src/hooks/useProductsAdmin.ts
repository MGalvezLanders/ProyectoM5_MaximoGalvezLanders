import { useProductsList } from "@/hooks/useProductsList";
import { useProductsActions } from "@/hooks/useProductsActions";
import type { ProductFilters } from "@/services/products.service";

export function useProductsAdmin(filters: ProductFilters = {}) {
  const { products, loading, error, refetch } = useProductsList(filters);
  const actions = useProductsActions();

  return {
    products,
    loading,
    error,
    refetch,
    ...actions,
  };
}
