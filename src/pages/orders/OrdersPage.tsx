import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Container, Spinner, SolDeMayo, BackButton, Button, Card, Badge } from "@/components";
import { useUserOrders } from "@/hooks/useUserOrders";
import { formatPrice, formatOrderDateShort } from "@/utils/formatting";
import { STATUS_LABELS, STATUS_TONES } from "@/utils/order/orderStatus";
import type { Order, OrderStatus } from "@/types/order";

type StatusFilter = OrderStatus | "all";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all",        label: "Todos" },
  { value: "pending",    label: "Pendientes" },
  { value: "processing", label: "En proceso" },
  { value: "completed",  label: "Completados" },
  { value: "cancelled",  label: "Cancelados" },
];

function StatusDot({ status }: { status: OrderStatus }) {
  const color = {
    pending:    "bg-sun-500",
    processing: "bg-sky-arg-500",
    completed:  "bg-field-500",
    cancelled:  "bg-terracota-500",
  }[status];
  return (
    <span className="relative inline-flex w-2 h-2 shrink-0">
      <span className={`absolute inset-0 rounded-full ${color}`} />
      {(status === "pending" || status === "processing") && (
        <span className={`absolute inset-0 rounded-full ${color} opacity-60 animate-ping`} />
      )}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const totalUnits = order.items.reduce((acc, i) => acc + i.quantity, 0);
  const previews = order.items.slice(0, 3);
  const extra = order.items.length - previews.length;

  return (
    <Link to={`/orders/${order.id}`} className="block group">
      <Card
        padded={false}
        className="p-4 sm:p-5 hover:shadow-warm-lg group-hover:-translate-y-0.5 transition-all"
      >
        <div className="flex items-start gap-4">
          {/* Preview de imágenes apiladas */}
          <div className="hidden sm:flex -space-x-3 shrink-0">
            {previews.map((item, i) => (
              <div
                key={item.id}
                className="w-14 h-14 rounded-lg border-2 border-cream-50 bg-cream-100 overflow-hidden shadow-sm"
                style={{ zIndex: previews.length - i }}
              >
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-sepia-200" />
                )}
              </div>
            ))}
            {extra > 0 && (
              <div className="w-14 h-14 rounded-lg border-2 border-cream-50 bg-leather-700 text-cream-50 flex items-center justify-center text-xs font-bold shadow-sm">
                +{extra}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusDot status={order.status} />
              <span className="text-xs font-semibold text-leather-500 uppercase tracking-wider">
                {STATUS_LABELS[order.status]}
              </span>
            </div>
            <p className="font-display font-semibold text-leather-900 text-base truncate">
              Pedido #{order.id.slice(0, 8)}
            </p>
            <p className="text-sm text-leather-600 mt-0.5">
              {formatOrderDateShort(order.orderDate)} · {totalUnits}{" "}
              {totalUnits === 1 ? "producto" : "productos"}
            </p>
            {order.shippingInfo?.city && (
              <p className="text-xs text-leather-500 mt-1 truncate">
                → {order.shippingInfo.city}
                {order.shippingInfo.province ? `, ${order.shippingInfo.province}` : ""}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <p className="font-display text-lg font-bold text-leather-900 tabular-nums">
              {formatPrice(order.totalPrice)}
            </p>
            <span className="sm:hidden">
              <Badge tone={STATUS_TONES[order.status]}>
                {STATUS_LABELS[order.status]}
              </Badge>
            </span>
            <span className="hidden sm:inline-flex text-xs text-leather-500 items-center gap-1 group-hover:text-leather-900 transition-colors">
              Ver detalle
              <svg className="w-3 h-3 transition-transform group-hover:translate-x-0.5" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function OrdersPage() {
  const { orders, loading, error } = useUserOrders();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const counts = useMemo(() => {
    const c = { all: orders.length, pending: 0, processing: 0, completed: 0, cancelled: 0 } as Record<StatusFilter, number>;
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  if (loading) {
    return (
      <Container size="lg" className="py-16">
        <div className="flex justify-center">
          <Spinner className="w-8 h-8" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="md" className="py-16">
        <div className="text-center">
          <p className="text-terracota-500 mb-4">{error}</p>
        </div>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container size="md" className="py-16">
        <div className="text-center max-w-md mx-auto">
          <SolDeMayo className="w-16 h-16 mx-auto mb-4 opacity-70" />
          <h1 className="font-display text-3xl font-bold text-leather-900 mb-2">
            Todavía no tenés pedidos
          </h1>
          <p className="text-leather-700 mb-6">
            Cuando hagas tu primera compra, aparece acá tu historial.
          </p>
          <Link to="/catalog">
            <Button>Ir al catálogo</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-12">
      <BackButton variant="backHome" className="mb-4">
        Volver al inicio
      </BackButton>
      <h1 className="font-display text-3xl font-bold text-leather-900 mb-2">
        Mis pedidos
      </h1>
      <p className="text-sm text-leather-600 mb-6">
        {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} en tu historial
      </p>

      {/* Filtros por estado */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const n = counts[f.value];
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={[
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50",
                active
                  ? "bg-leather-700 text-cream-50 border-leather-700"
                  : "bg-cream-50 text-leather-700 border-sepia-400 hover:border-leather-500",
              ].join(" ")}
            >
              {f.label}
              <span
                className={[
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                  active ? "bg-cream-50/20 text-cream-50" : "bg-sepia-200 text-leather-700",
                ].join(" ")}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-leather-600">
          No tenés pedidos en este estado.
        </div>
      ) : (
        <motion.ul layout className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {filtered.map((order) => (
              <motion.li
                key={order.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <OrderCard order={order} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </Container>
  );
}
