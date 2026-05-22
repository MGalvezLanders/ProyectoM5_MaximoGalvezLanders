import { useContext } from "react";
import { ProductsActionsContext } from "@/context/ProductsContext";

export function useProductsActions() {
  const ctx = useContext(ProductsActionsContext);
  if (!ctx) {
    throw new Error(
      "useProductsActions debe usarse dentro de <ProductsProvider>",
    );
  }
  return ctx;
}
