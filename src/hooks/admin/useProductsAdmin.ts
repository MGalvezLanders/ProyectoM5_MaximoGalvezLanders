import { useProductsList } from "@/hooks/products/useProductsList";
import { useProductsActions } from "@/hooks/products/useProductsActions";
import type { ProductFilters } from "@/services/product/products.service";

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
