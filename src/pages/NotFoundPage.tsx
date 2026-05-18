import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";

const NotFoundPage = () => {
  return (
    <Container size="md" className="py-24 text-center">
      <SolDeMayo className="w-16 h-16 text-sun-500 mx-auto mb-4 opacity-70" />
      <h1 className="font-display text-5xl font-bold mb-3">404</h1>
      <p className="text-leather-700 mb-6">
        Esta página se nos perdió en el campo. Volvé al inicio.
      </p>
      <Link to="/">
        <Button>Volver al inicio</Button>
      </Link>
    </Container>
  );
};

export default NotFoundPage;
