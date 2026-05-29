import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  matchOrderDate,
  matchOrderId,
  matchOrderStatus,
  matchOrderTotal,
  matchOrderUser,
} from "@/utils/filters";
import type { Order, OrderStatus } from "@/types/order";

export type AdminOrderFiltersResult = {
  id: string;
  setId: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  user: string;
  setUser: (value: string) => void;
  total: string;
  setTotal: (value: string) => void;
  status: OrderStatus | null;
  setStatus: (value: OrderStatus | null) => void;
  filtered: Order[];
  hasActiveFilters: boolean;
  clearAll: () => void;
};

/**
 * Filtros independientes por columna para la lista de órdenes del admin.
 * Texto busca dentro de cada campo respectivo; status filtra por enum exacto.
 */
export function useAdminOrderFilters(orders: Order[]): AdminOrderFiltersResult {
  const [id, setId] = useState("");
  const [date, setDate] = useState("");
  const [user, setUser] = useState("");
  const [total, setTotal] = useState("");
  const [status, setStatus] = useState<OrderStatus | null>(null);

  const debouncedId = useDebounce(id, 200);
  const debouncedDate = useDebounce(date, 200);
  const debouncedUser = useDebounce(user, 200);
  const debouncedTotal = useDebounce(total, 200);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          matchOrderId(o, debouncedId) &&
          matchOrderDate(o, debouncedDate) &&
          matchOrderUser(o, debouncedUser) &&
          matchOrderTotal(o, debouncedTotal) &&
          matchOrderStatus(o, status),
      ),
    [orders, debouncedId, debouncedDate, debouncedUser, debouncedTotal, status],
  );

  const hasActiveFilters =
    id.trim().length > 0 ||
    date.trim().length > 0 ||
    user.trim().length > 0 ||
    total.trim().length > 0 ||
    status !== null;

  const clearAll = () => {
    setId("");
    setDate("");
    setUser("");
    setTotal("");
    setStatus(null);
  };

  return {
    id,
    setId,
    date,
    setDate,
    user,
    setUser,
    total,
    setTotal,
    status,
    setStatus,
    filtered,
    hasActiveFilters,
    clearAll,
  };
}
