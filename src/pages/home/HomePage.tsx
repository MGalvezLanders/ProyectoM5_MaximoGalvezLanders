import { Link } from "react-router-dom";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";

const features = [
  {
    title: "Mates curados a mano",
    body: "Cada mate llega listo para el primer cebado, sin pasos extra.",
  },
  {
    title: "Cuero genuino argentino",
    body: "Materas, fundas y accesorios trabajados con cuero del litoral.",
  },
  {
    title: "Envíos a todo el país",
    body: "Despachamos en 24-48hs desde nuestro taller. Tracking incluido.",
  },
];

const HomePage = () => {
  return (
    <main className="paper-texture min-h-[calc(100vh-65px)]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -right-20 text-sun-400/20 pointer-events-none">
          <SolDeMayo className="w-80 h-80" />
        </div>

        <Container size="lg" className="relative py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-arg-700 mb-4">
              Tradición argentina · desde 2024
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-leather-900 leading-tight mb-6">
              Pequeños mates,
              <br />
              grandes momentos.
            </h1>
            <p className="text-lg text-leather-700 mb-8 max-w-lg">
              Mates, termos, materas, ponchos y sombreros artesanales. Hechos
              con tradición, pensados para compartir.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/catalog">
                <Button size="lg">Ver catálogo</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Crear cuenta
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features */}
      <section className="border-t border-sepia-300 bg-cream-100/60">
        <Container size="lg" className="py-16">
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="text-center sm:text-left">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sun-400 text-leather-900 mb-3">
                  <SolDeMayo className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-leather-700 leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
};

export default HomePage;
