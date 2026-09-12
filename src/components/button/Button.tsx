import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
};

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-leather-900 text-cream-50 hover:bg-leather-800 shadow-warm-sm focus-visible:ring-leather-700",
  secondary:
    "bg-sun-500 text-leather-900 hover:bg-sun-600 shadow-warm-sm focus-visible:ring-sun-600",
  outline:
    "bg-transparent text-leather-900 border border-leather-900 hover:bg-leather-900 hover:text-cream-50 focus-visible:ring-leather-700",
  ghost:
    "bg-transparent text-leather-700 hover:bg-cream-100 focus-visible:ring-leather-500",
  destructive:
    "bg-terracota-500 text-cream-50 hover:brightness-95 focus-visible:ring-terracota-500",
};

const SIZES: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={[
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
