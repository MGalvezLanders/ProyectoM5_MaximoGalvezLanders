import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  matchProductCategory,
  matchProductName,
  matchProductPrice,
  matchProductStock,
} from "@/utils/filters";
import type { Product } from "@/types/product";

export type AdminProductFiltersResult = {
  name: string;
  setName: (value: string) => void;
  category: string | null;
  setCategory: (value: string | null) => void;
  price: string;
  setPrice: (value: string) => void;
  stock: string;
  setStock: (value: string) => void;
  filtered: Product[];
  hasActiveFilters: boolean;
  clearAll: () => void;
};

/**
 * Filtros independientes por columna para la lista de productos del admin.
 * Cada filtro busca SOLO en su columna y todos se combinan con AND.
 */
export function useAdminProductFilters(
  products: Product[],
): AdminProductFiltersResult {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const debouncedName = useDebounce(name, 200);
  const debouncedPrice = useDebounce(price, 200);
  const debouncedStock = useDebounce(stock, 200);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          matchProductName(p, debouncedName) &&
          matchProductCategory(p, category) &&
          matchProductPrice(p, debouncedPrice) &&
          matchProductStock(p, debouncedStock),
      ),
    [products, debouncedName, category, debouncedPrice, debouncedStock],
  );

  const hasActiveFilters =
    name.trim().length > 0 ||
    category !== null ||
    price.trim().length > 0 ||
    stock.trim().length > 0;

  const clearAll = () => {
    setName("");
    setCategory(null);
    setPrice("");
    setStock("");
  };

  return {
    name,
    setName,
    category,
    setCategory,
    price,
    setPrice,
    stock,
    setStock,
    filtered,
    hasActiveFilters,
    clearAll,
  };
}
