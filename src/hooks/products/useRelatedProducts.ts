import { useMemo } from "react";
import { useProductsList } from "./useProductsList";
import type { Product } from "@/types/product";

const MIN_SAME_CATEGORY = 4;
const LIMIT = 8;

export function useRelatedProducts(
  currentId: string,
  category: string
): { products: Product[]; isMixed: boolean; loading: boolean } {
  const { products: all, loading } = useProductsList();

  const result = useMemo(() => {
    if (!all.length) return { products: [], isMixed: false };

    const sameCategory = all.filter(
      (p) => p.category === category && p.id !== currentId
    );

    if (sameCategory.length >= MIN_SAME_CATEGORY) {
      return { products: sameCategory.slice(0, LIMIT), isMixed: false };
    }

    // Rellena con productos de otras categorías ordenados por más reciente
    const others = all
      .filter((p) => p.category !== category && p.id !== currentId)
      .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));

    return {
      products: [...sameCategory, ...others].slice(0, LIMIT),
      isMixed: sameCategory.length < MIN_SAME_CATEGORY,
    };
  }, [all, currentId, category]);

  return { ...result, loading };
}
