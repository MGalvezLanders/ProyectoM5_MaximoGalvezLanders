import { useState, useEffect } from "react";
import { getTopProducts } from "@/services/product/products.service";
import type { Product } from "@/types/product";

export function useBestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopProducts(8)
      .then((items) => setProducts(items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
