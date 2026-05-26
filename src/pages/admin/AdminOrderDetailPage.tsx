import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/button/Button";
import { Spinner } from "@/components/ui/Spinner";
import {
  getOrderById,
  updateOrderStatus,
} from "@/services/order/orders.service";
import { transitions } from "@/types/orderStatus";
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

const STATUS_TONES: Record<OrderStatus, "sun" | "sky" | "field" | "danger"> = {
  pending: "sun",
  processing: "sky",
  completed: "field",
  cancelled: "danger",
};

const formatOrderDate = (date: unknown): string => {
  if (date instanceof Date) return date.toLocaleString("es-AR");
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

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getOrderById(id)
      .then((data) => {
        if (!cancelled) {
          if (!data) setError("Orden no encontrada");
          else setOrder(data);
        }
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error cargando");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    setStatusError(null);
    setSaving(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Error actualizando el estado",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <p className="text-terracota-500 mb-3">
          {error ?? "Orden no encontrada"}
        </p>
        <Link to="/admin/orders">
          <Button variant="outline">Volver a órdenes</Button>
        </Link>
      </div>
    );
  }

  const validNextStatuses = transitions[order.status] ?? [];
  const isFinal = validNextStatuses.length === 0;

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">
            Orden #{order.id.slice(0, 8)}
          </h2>
          <p className="text-sm text-leather-600 font-mono">{order.id}</p>
        </div>
        <Link to="/admin/orders">
          <Button variant="outline" size="sm">
            ← Volver
          </Button>
        </Link>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        <InfoCard label="Fecha">{formatOrderDate(order.orderDate)}</InfoCard>
        <InfoCard label="Usuario">
          <span className="font-mono text-xs">{order.userId}</span>
        </InfoCard>
        <InfoCard label="Total">
          <span className="font-display text-xl font-bold">
            {formatPrice(order.totalPrice)}
          </span>
        </InfoCard>
        <InfoCard label="Estado actual">
          <Badge tone={STATUS_TONES[order.status] ?? "neutral"}>
            {STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </InfoCard>
      </div>

      <section className="bg-cream-100/60 border border-sepia-300 rounded-xl p-4">
        <h3 className="font-display text-lg font-semibold mb-3">
          Información de envío
        </h3>
        <dl className="text-sm space-y-1">
          <div className="flex gap-2">
            <dt className="text-leather-500 w-24">Nombre:</dt>
            <dd className="text-leather-900">
              {order.shippingInfo?.name ?? "—"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-leather-500 w-24">Dirección:</dt>
            <dd className="text-leather-900">
              {order.shippingInfo?.address ?? "—"}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-leather-500 w-24">Ciudad:</dt>
            <dd className="text-leather-900">
              {order.shippingInfo?.city ?? "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-cream-100/60 border border-sepia-300 rounded-xl p-4">
        <h3 className="font-display text-lg font-semibold mb-3">
          Productos ({order.items.length})
        </h3>
        <ul className="divide-y divide-sepia-300/60">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover border border-sepia-300 flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-leather-900 truncate">
                  {item.name}
                </p>
                <p className="text-sm text-leather-600">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="font-medium tabular-nums text-leather-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-cream-50 border border-sepia-300 rounded-xl p-4">
        <h3 className="font-display text-lg font-semibold mb-3">
          Cambiar estado
        </h3>

        {isFinal ? (
          <p className="text-sm text-leather-600">
            Esta orden está en estado final (
            <strong>{STATUS_LABELS[order.status] ?? order.status}</strong>) y no
            admite más cambios.
          </p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <select
                value=""
                onChange={(e) =>
                  handleStatusChange(e.target.value as OrderStatus)
                }
                disabled={saving}
                className="px-3 py-2 rounded-lg bg-cream-50 text-leather-900 border border-sepia-400 focus:outline-none focus:ring-2 focus:ring-sun-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  Mover a...
                </option>
                {validNextStatuses.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              {saving && <Spinner className="w-5 h-5" />}
            </div>
            {statusError && (
              <p className="text-xs text-terracota-500" role="alert">
                {statusError}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream-100 border border-sepia-300 rounded-xl p-4">
      <span className="block text-xs uppercase tracking-wider text-leather-500 mb-1">
        {label}
      </span>
      <div className="text-leather-900">{children}</div>
    </div>
  );
}
