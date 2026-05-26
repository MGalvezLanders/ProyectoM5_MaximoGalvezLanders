import { Link } from "react-router-dom";
import { Container, Spinner, SolDeMayo, BackButton, Button, Card, Badge } from "@/components";
import { useUserOrders } from "@/hooks/useUserOrders";
import { formatPrice, formatOrderDateShort } from "@/utils/formatting";
import { STATUS_LABELS, STATUS_TONES } from "@/utils/order/orderStatus";

export default function OrdersPage() {
  const { orders, loading, error } = useUserOrders();

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
      <BackButton variant="backHome" className="mb-4">
        Volver al inicio
      </BackButton>
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
                      {formatOrderDateShort(order.orderDate)} ·{" "}
                      {order.items.length}{" "}
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
