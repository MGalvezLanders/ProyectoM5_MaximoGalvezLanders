import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SolDeMayo } from "@/components/ui/SolDeMayo";

const pampaEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const LOGIN_FEATURES = [
  "Cuero genuino del litoral",
  "Mates curados a mano",
  "Envíos a todo el país",
] as const;

const REGISTER_FEATURES = [
  "Comunidad de amantes del mate",
  "Productos artesanales únicos",
  "Envíos a todo el país",
] as const;

export function AuthLayout() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  const panelTitle = isLogin ? "La Gauchada" : "Sumate al fogón";
  const panelSubtitle = isLogin
    ? "Mates, materas y cuero genuino argentino. Hecho a mano, pensado para compartir."
    : "Creá tu cuenta y empezá a cebar. Una tradición que se comparte alrededor del fuego.";
  const panelFeatures = isLogin ? LOGIN_FEATURES : REGISTER_FEATURES;

  return (
    <div className="min-h-[calc(100vh-65px)] flex relative overflow-hidden">
      {/* Columna del formulario: izquierda en login, derecha en register */}
      <div
        className={`paper-texture flex items-center justify-center px-6 py-12 w-full md:w-1/2 ${
          isLogin ? "md:order-1" : "md:order-2"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Relleno del lado opuesto (queda cubierto por el panel) */}
      <div
        className={`hidden md:block md:w-1/2 paper-texture ${
          isLogin ? "md:order-2" : "md:order-1"
        }`}
      />

      {/* Panel oscuro deslizante — solo desktop */}
      {/* initial: viene desde afuera la primera vez */}
      {/* animate: se mueve reactivamente al cambiar de ruta */}
      <motion.div
        className="hidden md:flex absolute inset-y-0 w-1/2 bg-leather-900 flex-col items-center justify-center overflow-hidden px-12 py-16"
        style={{ zIndex: 20 }}
        initial={{ left: isLogin ? "100%" : "-50%" }}
        animate={{ left: isLogin ? "50%" : "0%" }}
        transition={{ duration: 0.7, ease: pampaEase }}
      >
        {/* Sol de Mayo de fondo, tenue */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.2] pointer-events-none">
          <SolDeMayo className="w-[28rem] h-[28rem]" spin={90} />
        </div>

        {/* Velo */}
        <div className="absolute inset-0 bg-gradient-to-b from-leather-900/85 via-leather-900/70 to-leather-900/85 pointer-events-none" />

        {/* Contenido del panel: cambia con fade al navegar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login-panel" : "register-panel"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
            className="relative z-10 text-center max-w-xs"
          >
            <div className="mx-auto mb-6 w-fit drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)]">
              <SolDeMayo className="w-20 h-20" spin={45} />
            </div>

            <h2
              className="font-display text-5xl font-bold text-sun-400 mb-3 leading-tight tracking-tight"
              style={{
                textShadow:
                  "0 1px 0 rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8), 0 0 18px rgba(0,0,0,0.6)",
              }}
            >
              {panelTitle}
            </h2>

            <p className="text-cream-100 text-sm leading-relaxed">
              {panelSubtitle}
            </p>

            <ul className="mt-8 space-y-3 text-left">
              {panelFeatures.map((text) => (
                <li
                  key={text}
                  className="flex items-center gap-2.5 text-sm text-cream-50 font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-sun-400 flex-shrink-0 shadow-[0_0_6px_rgba(246,180,14,0.6)]" />
                  {text}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
