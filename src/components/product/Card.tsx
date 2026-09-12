import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
};

export function Card({ children, padded = true, className = "", ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={[
        "bg-cream-50 border border-sepia-300 radius-card shadow-warm-sm",
        padded ? "p-6" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
