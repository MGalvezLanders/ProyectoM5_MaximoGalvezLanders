import type { ReactNode } from "react";

type BadgeTone = "neutral" | "sky" | "sun" | "field" | "danger";

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-cream-200 text-leather-700 border-sepia-400",
  sky: "bg-sky-arg-300 text-sky-arg-700 border-sky-arg-500",
  sun: "bg-sun-400 text-leather-900 border-sun-600",
  field: "bg-field-500/15 text-field-500 border-field-500/40",
  danger: "bg-terracota-500/15 text-terracota-500 border-terracota-500/40",
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium tracking-wide",
        TONES[tone],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
