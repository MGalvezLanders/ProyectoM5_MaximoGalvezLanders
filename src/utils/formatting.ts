export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

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
