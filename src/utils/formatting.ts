export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(price);

export const formatOrderDate = (date: unknown): string => {
  if (
    date &&
    typeof date === "object" &&
    "toDate" in date &&
    typeof (date as { toDate: () => Date }).toDate === "function"
  ) {
    return (date as { toDate: () => Date }).toDate().toLocaleString("es-AR");
  }
  return "—";
};

export const formatOrderDateShort = (date: unknown): string => {
  if (
    date &&
    typeof date === "object" &&
    "toDate" in date &&
    typeof (date as { toDate: () => Date }).toDate === "function"
  ) {
    return (date as { toDate: () => Date })
      .toDate()
      .toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
  }
  return "—";
};

//* DD/MM/YYYY — usado en la tabla del admin y en el matcher de filtros para
//* que la búsqueda por fecha funcione contra el formato visible.
export const formatOrderDateNumeric = (date: unknown): string => {
  if (date instanceof Date) return date.toLocaleDateString("es-AR");
  if (
    date &&
    typeof date === "object" &&
    "toDate" in date &&
    typeof (date as { toDate: () => Date }).toDate === "function"
  ) {
    return (date as { toDate: () => Date })
      .toDate()
      .toLocaleDateString("es-AR");
  }
  return "—";
};
