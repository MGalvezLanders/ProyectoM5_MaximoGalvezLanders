import { useState, useEffect } from "react";
import { getProducts } from "@/services/product/products.service";
import type { Product } from "@/types/product";

export function useBestSellers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((all) => setProducts(all.slice(0, 8)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
