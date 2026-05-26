export type StockBadge = {
  label: string;
  tone: "field" | "sun" | "danger" | "neutral";
};

export const getStockBadge = (stock: number): StockBadge => {
  if (stock === 0) return { label: "Sin stock", tone: "danger" };
  if (stock <= 3) return { label: "Últimas unidades", tone: "sun" };
  if (stock <= 10) return { label: "Pocas unidades", tone: "sun" };
  return { label: "Disponible", tone: "field" };
};
