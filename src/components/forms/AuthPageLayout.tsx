import { motion } from "motion/react";
import { SolDeMayo } from "@/components/ui/SolDeMayo";

const pampaEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface AuthPageLayoutProps {
  panelSide: "left" | "right";
  panelTitle: string;
  panelSubtitle: string;
  panelFeatures: readonly string[];
  children: React.ReactNode;
}

export function AuthPageLayout({
  panelSide,
  panelTitle,
  panelSubtitle,
  panelFeatures,
  children,
}: AuthPageLayoutProps) {
  const panelOnRight = panelSide === "right";

  return (
    <div className="min-h-[calc(100vh-65px)] flex relative overflow-hidden">
      {/* Form column: full-width on mobile, half on desktop in the correct side */}
      <div
        className={`paper-texture flex items-center justify-center px-6 py-12 w-full md:w-1/2 ${
          panelOnRight ? "md:order-1" : "md:order-2"
        }`}
      >
        {children}
      </div>

      {/* Empty spacer to fill the other desktop half (covered by the panel) */}
      <div className="hidden md:block md:w-1/2 paper-texture" />

      {/* Sliding dark panel — desktop only */}
      <motion.div
        className={`hidden md:flex absolute top-0 h-full w-1/2 bg-leather-900 flex-col items-center justify-center overflow-hidden px-12 py-16 ${
          panelOnRight ? "left-1/2" : "left-0"
        }`}
        initial={{ x: panelOnRight ? "100%" : "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.72, ease: pampaEase, delay: 0.05 }}
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
            {panelTitle}
          </h2>

          <p className="text-cream-100 text-sm leading-relaxed">{panelSubtitle}</p>

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
        </div>
      </motion.div>
    </div>
  );
}
