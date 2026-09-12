import type { SVGProps } from "react";

/**
 * Set de iconos custom con strokeWidth uniforme (1.6) y trazos redondeados.
 * Todo se ve consistente y "hermano" — ningún icono queda "gordo" o "flaco".
 * Uso: <Icons.Cart className="w-5 h-5" />
 */

const BASE: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

type IconProps = SVGProps<SVGSVGElement>;

export const Icons = {
  Search: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Cart: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M3 3h2l2.4 12.3a2 2 0 002 1.7h8.6a2 2 0 002-1.6L21 8H6" />
      <circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  Heart: (props: IconProps & { filled?: boolean }) => (
    <svg {...BASE} fill={props.filled ? "currentColor" : "none"} {...props}>
      <path d="M12 20.5s-8-4.5-8-11a5 5 0 018-3.5A5 5 0 0120 9.5c0 6.5-8 11-8 11z" />
    </svg>
  ),
  User: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  Close: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Check: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M4 12l5 5L20 6" />
    </svg>
  ),
  ChevronDown: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  ChevronLeft: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  ),
  ChevronRight: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  ArrowRight: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  ),
  Filter: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M4 6h16M6 12h12M10 18h4" />
    </svg>
  ),
  Truck: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M3 16V7h10v9M13 10h4l3 4v2h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  ),
  Package: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
      <path d="M4 8l8 4 8-4M12 12v10" />
    </svg>
  ),
  Lock: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 118 0v3" />
    </svg>
  ),
  Refresh: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M4 12a8 8 0 0114-5.3L20 8M20 4v4h-4M20 12a8 8 0 01-14 5.3L4 16M4 20v-4h4" />
    </svg>
  ),
  Star: (props: IconProps & { filled?: boolean }) => (
    <svg {...BASE} fill={props.filled ? "currentColor" : "none"} {...props}>
      <path d="M12 2l3 6.9 7.5 1L17 14.6l1.3 7.4L12 18l-6.3 4 1.3-7.4L1.5 9.9 9 8.9 12 2z" />
    </svg>
  ),
  Zoom: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3M8 11h6M11 8v6" />
    </svg>
  ),
  Menu: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  Play: (props: IconProps) => (
    <svg {...BASE} fill="currentColor" stroke="none" {...props}>
      <path d="M7 5v14l12-7z" />
    </svg>
  ),
  Pause: (props: IconProps) => (
    <svg {...BASE} fill="currentColor" stroke="none" {...props}>
      <rect x="6" y="5" width="4" height="14" />
      <rect x="14" y="5" width="4" height="14" />
    </svg>
  ),
  Logout: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <path d="M9 20H5a1 1 0 01-1-1V5a1 1 0 011-1h4M15 16l4-4-4-4M19 12H9" />
    </svg>
  ),
  Warning: (props: IconProps) => (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16v.5" />
    </svg>
  ),
};

export type IconName = keyof typeof Icons;
