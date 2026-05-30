import type { OrderStatus } from "@/types/order";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  completed: "Completada",
  cancelled: "Cancelada",
};

export const STATUS_TONES: Record<
  OrderStatus,
  "sun" | "sky" | "field" | "danger"
> = {
  pending: "sun",
  processing: "sky",
  completed: "field",
  cancelled: "danger",
};

//* Lista de estados en orden de display — base para filtros y selectores.
export const STATUS_ORDER: readonly OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;

export const STATUS_OPTIONS: ReadonlyArray<{
  value: OrderStatus;
  label: string;
}> = STATUS_ORDER.map((value) => ({ value, label: STATUS_LABELS[value] }));
