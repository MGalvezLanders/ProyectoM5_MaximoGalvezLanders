import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";

const NotFoundPage = () => {
  return (
    <main className="paper-texture min-h-[calc(100vh-65px)] flex items-center justify-center">
      <Container size="md" className="py-16 text-center relative overflow-hidden">
        {/* Sol de Mayo de fondo, grande y tenue (rayos giran, cara fija) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <SolDeMayo className="w-[32rem] h-[32rem] opacity-10" spin={80} />
        </div>

        <div className="relative z-10">
          {/* Sol de Mayo animado en primer plano */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-fit mx-auto mb-4"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 6, -6, 0] }}
              transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
            >
              <SolDeMayo className="w-20 h-20 mx-auto opacity-80" />
            </motion.div>
          </motion.div>

          {/* Número 404 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[8rem] sm:text-[10rem] font-bold leading-none mb-2 select-none"
            style={{ color: "var(--color-leather-900)", opacity: 0.12 }}
          >
            404
          </motion.h1>

          {/* Mensaje principal */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-2xl font-semibold text-leather-900 mb-2"
          >
            Esta página se perdió en el campo.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="text-leather-600 mb-8 text-sm"
          >
            Quizás el gaucho la llevó a otro pago. Volvé al inicio o dale
            una vuelta por el catálogo.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-3 justify-center"
          >
            <Link to="/">
              <Button>Volver al inicio</Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline">Ver catálogo</Button>
            </Link>
          </motion.div>
        </div>
      </Container>
    </main>
  );
};

export default NotFoundPage;
