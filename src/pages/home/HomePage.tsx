import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { fadeUp, stagger, cardReveal } from "@/utils/animations";

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
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();

  // Sol de Mayo: rotación y desvanecimiento al hacer scroll
  const solRotate = useTransform(scrollY, [0, 600], [0, 50]);
  const solScale = useTransform(scrollY, [0, 400], [1, 1.2]);
  const solOpacity = useTransform(scrollY, [0, 320], [0.22, 0]);

  return (
    <main className="paper-texture min-h-[calc(100vh-65px)]">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative overflow-hidden">
        {/* Sol de Mayo: rayos giran (cara fija) + parallax de scroll */}
        <motion.div
          style={{ scale: solScale, opacity: solOpacity }}
          className="absolute -top-20 -right-20 pointer-events-none select-none"
        >
          <SolDeMayo className="w-96 h-96" spin={60} />
        </motion.div>

        <Container size="lg" className="relative py-20 sm:py-28">
          <motion.div
            className="max-w-2xl"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-arg-700 mb-4"
            >
              Tradición argentina · desde 2024
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-6xl font-bold text-leather-900 leading-tight mb-6"
            >
              Pequeños mates,
              <br />
              grandes momentos.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-leather-700 mb-8 max-w-lg"
            >
              Mates, termos, materas, ponchos y sombreros artesanales. Hechos
              con tradición, pensados para compartir.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/catalog">
                <Button size="lg">Ver catálogo</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">
                  Crear cuenta
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* ── Banda argentina animada ───────────────────────────────────────── */}
      <motion.div
        className="band-argentina h-2"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{ originX: 0 }}
      />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="border-b border-sepia-300 bg-cream-100/60">
        <Container size="lg" className="py-16">
          <motion.div
            className="grid gap-8 sm:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={cardReveal}
                className="text-center sm:text-left"
              >
                <motion.div
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-sun-400 text-leather-900 mb-3 cursor-default"
                >
                  <SolDeMayo className="w-6 h-6" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-leather-700 leading-relaxed">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>
    </main>
  );
};

export default HomePage;
