import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function OrdersPage() {
  return (
    <Container size="lg" className="py-12">
      <h1 className="font-display text-3xl font-bold mb-6">Mis pedidos</h1>
      <Card>
        <p className="text-leather-700">
          Próximamente: historial de compras y seguimiento de envíos.
        </p>
      </Card>
    </Container>
  );
}
