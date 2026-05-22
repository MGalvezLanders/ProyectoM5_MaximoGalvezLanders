import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreError } from "@/hooks/errors/useFirestoreError";
import { getUserOrders } from "@/services/orders.service";
import type { Order, OrderStatus } from "@/types/order";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  processing: "Enviado",
  completed: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_TONES: Record<OrderStatus, "sun" | "sky" | "field" | "danger"> = {
  pending: "sun",
  processing: "sky",
  completed: "field",
  cancelled: "danger",
};

const formatOrderDate = (date: unknown): string => {
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

export default function OrdersPage() {
  const { user } = useAuth();
  const { error, captureError, clearError } = useFirestoreError();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    getUserOrders(user.uid)
      .then((data) => {
        if (cancelled) return;
        setOrders(data);
        clearError();
      })
      .catch((err) => {
        if (!cancelled) captureError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, captureError, clearError]);

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
          <SolDeMayo className="w-16 h-16 text-sun-500 mx-auto mb-4 opacity-70" />
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
      <h1 className="font-display text-3xl font-bold text-leather-900 mb-2">
        Mis pedidos
      </h1>
      <p className="text-sm text-leather-600 mb-6">
        {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} en tu
        historial
      </p>

      <ul className="flex flex-col gap-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link to={`/orders/${order.id}`} className="block">
              <Card
                padded={false}
                className="p-4 hover:shadow-warm-lg transition-shadow"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-xs uppercase tracking-wider text-leather-500 mb-0.5">
                      Pedido #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-leather-700">
                      {formatOrderDate(order.orderDate)} · {order.items.length}{" "}
                      {order.items.length === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge tone={STATUS_TONES[order.status]}>
                      {STATUS_LABELS[order.status]}
                    </Badge>
                    <p className="font-display text-lg font-bold text-leather-900 tabular-nums">
                      {formatPrice(order.totalPrice)}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
