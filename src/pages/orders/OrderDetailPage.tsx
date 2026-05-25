import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/product/Card";
import { Button } from "@/components/button/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { BackButton } from "@/components/button/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { useFirestoreError } from "@/hooks/errors/useFirestoreError";
import { getOrderById } from "@/services/orders.service";
import { formatPrice, formatOrderDate } from "@/utils/formatting";
import { STATUS_LABELS, STATUS_TONES } from "@/utils/orderStatus";
import type { Order } from "@/types/order";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { error, captureError, clearError } = useFirestoreError();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getOrderById(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
        } else {
          setOrder(data);
          clearError();
        }
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
  }, [id, captureError, clearError]);

  if (loading) {
    return (
      <Container size="lg" className="py-16">
        <div className="flex justify-center">
          <Spinner className="w-8 h-8" />
        </div>
      </Container>
    );
  }

  if (notFound || (order && user && order.userId !== user.uid)) {
    return (
      <Container size="md" className="py-16">
        <div className="text-center">
          <SolDeMayo className="w-16 h-16 text-sun-500 mx-auto mb-4 opacity-70" />
          <h1 className="font-display text-2xl font-bold mb-2">
            Pedido no encontrado
          </h1>
          <p className="text-leather-700 mb-6">
            El pedido no existe o no pertenece a tu cuenta.
          </p>
          <Link to="/orders">
            <Button variant="outline">Volver a mis pedidos</Button>
          </Link>
        </div>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container size="md" className="py-16">
        <div className="text-center">
          <p className="text-terracota-500 mb-4">
            {error ?? "No pudimos cargar el pedido"}
          </p>
          <Link to="/orders">
            <Button variant="outline">Volver a mis pedidos</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-12">
      <BackButton variant="back" className="mb-6">
        Volver a mis pedidos
      </BackButton>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-leather-900 mb-1">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-leather-600">
            Realizado el {formatOrderDate(order.orderDate)}
          </p>
        </div>
        <Badge tone={STATUS_TONES[order.status]}>
          {STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="font-display text-xl font-bold text-leather-900 mb-4">
              Productos ({order.items.length})
            </h2>
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
          </Card>

          <Card>
            <h2 className="font-display text-xl font-bold text-leather-900 mb-4">
              Información de envío
            </h2>
            <dl className="text-sm space-y-2">
              <div className="flex gap-2">
                <dt className="text-leather-500 w-24 flex-shrink-0">Nombre:</dt>
                <dd className="text-leather-900">{order.shippingInfo.name}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-leather-500 w-24 flex-shrink-0">
                  Dirección:
                </dt>
                <dd className="text-leather-900">
                  {order.shippingInfo.address}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-leather-500 w-24 flex-shrink-0">Ciudad:</dt>
                <dd className="text-leather-900">{order.shippingInfo.city}</dd>
              </div>
            </dl>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card>
            <h2 className="font-display text-xl font-bold text-leather-900 mb-4">
              Resumen
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-leather-700">Productos</dt>
                <dd className="font-medium text-leather-900">
                  {order.items.reduce((acc, i) => acc + i.quantity, 0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-leather-700">Estado</dt>
                <dd>
                  <Badge tone={STATUS_TONES[order.status]}>
                    {STATUS_LABELS[order.status]}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between pt-2 border-t border-sepia-300">
                <dt className="text-leather-900 font-display text-base font-bold">
                  Total
                </dt>
                <dd className="font-display text-xl font-bold text-leather-900">
                  {formatPrice(order.totalPrice)}
                </dd>
              </div>
            </dl>
            <Link to="/orders" className="block mt-4">
              <Button variant="outline" fullWidth>
                Volver a mis pedidos
              </Button>
            </Link>
          </Card>
        </aside>
      </div>
    </Container>
  );
}
