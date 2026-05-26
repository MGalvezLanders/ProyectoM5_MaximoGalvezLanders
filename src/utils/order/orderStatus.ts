import type { OrderStatus } from "@/types/order";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  completed: "Entregado",
  cancelled: "Cancelado",
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
