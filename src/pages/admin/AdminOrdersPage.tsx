import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/button/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ColumnHeader } from "@/components/admin/ColumnHeader";
import { TextFilterBody } from "@/components/admin/filters/TextFilterBody";
import { SelectFilterBody } from "@/components/admin/filters/SelectFilterBody";
import { useAdminOrderFilters } from "@/hooks/admin/useAdminOrderFilters";
import { getAllOrders } from "@/services/order/orders.service";
import { formatOrderDateNumeric, formatPrice } from "@/utils/formatting";
import {
  STATUS_LABELS,
  STATUS_OPTIONS,
  STATUS_TONES,
} from "@/utils/order/orderStatus";
import type { Order, OrderStatus } from "@/types/order";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
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
  } = useAdminOrderFilters(orders);

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

  return (
    <div className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-bold mb-1">Órdenes</h2>
        <p className="text-sm text-leather-600">
          {orders.length} orden{orders.length === 1 ? "" : "es"} en total
          {hasActiveFilters && (
            <>
              <span className="text-leather-900 font-medium">
                {" "}
                · {filtered.length} coinciden
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="ml-3 text-xs text-leather-600 hover:text-leather-900 underline"
              >
                Limpiar filtros
              </button>
            </>
          )}
        </p>
      </header>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!loading && error && (
        <p className="text-terracota-500 text-center py-8">{error}</p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className="text-leather-700 text-center py-12">
          No hay órdenes para mostrar.
        </p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead className="border-y border-sepia-300 bg-cream-100/60 text-leather-600">
              <tr>
                <th className="text-left px-6 py-3">
                  <ColumnHeader
                    label="ID"
                    filterActive={id.trim().length > 0}
                    onClear={() => setId("")}
                  >
                    <TextFilterBody
                      value={id}
                      onChange={setId}
                      placeholder="Buscar por ID..."
                    />
                  </ColumnHeader>
                </th>
                <th className="text-left px-3 py-3">
                  <ColumnHeader
                    label="Fecha"
                    filterActive={date.trim().length > 0}
                    onClear={() => setDate("")}
                  >
                    <TextFilterBody
                      value={date}
                      onChange={setDate}
                      placeholder="Ej: 12/10/2025"
                    />
                  </ColumnHeader>
                </th>
                <th className="text-left px-3 py-3">
                  <ColumnHeader
                    label="Usuario"
                    filterActive={user.trim().length > 0}
                    onClear={() => setUser("")}
                  >
                    <TextFilterBody
                      value={user}
                      onChange={setUser}
                      placeholder="ID o nombre..."
                    />
                  </ColumnHeader>
                </th>
                <th className="text-right px-3 py-3">
                  <ColumnHeader
                    label="Total"
                    align="right"
                    filterActive={total.trim().length > 0}
                    onClear={() => setTotal("")}
                  >
                    <TextFilterBody
                      value={total}
                      onChange={setTotal}
                      placeholder="Ej: 5000"
                    />
                  </ColumnHeader>
                </th>
                <th className="text-left px-3 py-3">
                  <ColumnHeader
                    label="Estado"
                    filterActive={status !== null}
                    onClear={() => setStatus(null)}
                  >
                    <SelectFilterBody<OrderStatus>
                      value={status}
                      onChange={setStatus}
                      options={STATUS_OPTIONS}
                    />
                  </ColumnHeader>
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-sepia-300/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-leather-700">
                    Ninguna orden coincide con los filtros.
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="ml-2 text-leather-900 underline hover:text-sun-600"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-100/40">
                    <td className="px-6 py-3 font-mono text-xs text-leather-600">
                      {o.id.slice(0, 8)}...
                    </td>
                    <td className="px-3 py-3 text-leather-700">
                      {formatOrderDateNumeric(o.orderDate)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
