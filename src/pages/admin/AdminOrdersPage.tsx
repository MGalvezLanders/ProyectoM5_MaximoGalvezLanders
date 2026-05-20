import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { getAllOrders } from "@/services/orders";
import type { Order, OrderStatus } from "@/types/order";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  completed: "Completada",
  cancelled: "Cancelada",
};

const STATUS_TONES: Record<
  OrderStatus,
  "sun" | "sky" | "field" | "danger"
> = {
  pending: "sun",
  processing: "sky",
  completed: "field",
  cancelled: "danger",
};

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

const formatOrderDate = (date: unknown): string => {
  if (date instanceof Date) return date.toLocaleDateString("es-AR");
  if (
    date &&
    typeof date === "object" &&
    "toDate" in date &&
    typeof (date as { toDate: () => Date }).toDate === "function"
  ) {
    return (date as { toDate: () => Date }).toDate().toLocaleDateString("es-AR");
  }
  return "—";
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAllOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Error cargando órdenes",
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold mb-1">Órdenes</h2>
        <p className="text-sm text-leather-600">
          {orders.length} orden{orders.length === 1 ? "" : "es"} en total
        </p>
      </header>

      <div className="flex items-center gap-2">
        <label
          htmlFor="status-filter"
          className="text-sm font-medium text-leather-700"
        >
          Filtrar por estado:
        </label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as OrderStatus | "all")}
          className="px-3 py-2 rounded-lg bg-cream-50 text-leather-900 border border-sepia-400 text-sm focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500"
        >
          <option value="all">Todas</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!loading && error && (
        <p className="text-terracota-500 text-center py-8">{error}</p>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <p className="text-leather-700 text-center py-12">
          No hay órdenes para mostrar.
        </p>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead className="border-y border-sepia-300 bg-cream-100/60 text-leather-600">
              <tr>
                <th className="text-left px-6 py-3 font-medium">ID</th>
                <th className="text-left px-3 py-3 font-medium">Fecha</th>
                <th className="text-left px-3 py-3 font-medium">Usuario</th>
                <th className="text-right px-3 py-3 font-medium">Total</th>
                <th className="text-left px-3 py-3 font-medium">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sepia-300/60">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-cream-100/40">
                  <td className="px-6 py-3 font-mono text-xs text-leather-600">
                    {o.id.slice(0, 8)}...
                  </td>
                  <td className="px-3 py-3 text-leather-700">
                    {formatOrderDate(o.orderDate)}
                  </td>
                  <td className="px-3 py-3 text-leather-700 font-mono text-xs">
                    {o.userId.slice(0, 10)}...
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">
                    {formatPrice(o.totalPrice)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={STATUS_TONES[o.status] ?? "neutral"}>
                      {STATUS_LABELS[o.status] ?? o.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link to={`/admin/orders/${o.id}`}>
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
