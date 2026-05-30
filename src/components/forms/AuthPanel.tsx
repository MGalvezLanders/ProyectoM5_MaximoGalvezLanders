import { motion } from "motion/react";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { fadeLeft } from "@/utils/animations";

type AuthPanelProps = {
  /** Título grande (ej: "La Gauchada" / "Sumate al fogón"). */
  title: string;
  /** Párrafo descriptivo bajo el título. */
  subtitle: string;
  /** Bullets que aparecen abajo. */
  features: readonly string[];
};

/**
 * Panel decorativo izquierdo de las páginas de auth.
 * Mismo layout para Login y Register; las páginas solo le pasan copy.
 */
export function AuthPanel({ title, subtitle, features }: AuthPanelProps) {
  return (
    <motion.div
      variants={fadeLeft}
      initial="hidden"
      animate="visible"
      className="hidden md:flex flex-col items-center justify-center bg-leather-900 relative overflow-hidden px-12 py-16"
    >
      {/* Sol de Mayo de fondo, tenue */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.2] pointer-events-none">
        <SolDeMayo className="w-[28rem] h-[28rem]" spin={90} />
      </div>

      {/* Velo para reforzar contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-leather-900/85 via-leather-900/70 to-leather-900/85 pointer-events-none" />

      <div className="relative z-10 text-center max-w-xs">
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
          {title}
        </h2>
        <p className="text-cream-100 text-sm leading-relaxed">{subtitle}</p>

        <ul className="mt-8 space-y-3 text-left">
          {features.map((text) => (
            <li
              key={text}
              className="flex items-center gap-2.5 text-sm text-cream-50 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-sun-400 flex-shrink-0 shadow-[0_0_6px_rgba(246,180,14,0.6)]" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
