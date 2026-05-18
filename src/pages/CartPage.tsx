import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function CartPage() {
  return (
    <Container size="lg" className="py-12">
      <h1 className="font-display text-3xl font-bold mb-6">Tu carrito</h1>
      <Card>
        <p className="text-leather-700">
          Próximamente: lista de productos seleccionados y total.
        </p>
      </Card>
    </Container>
  );
}
