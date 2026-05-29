import { Link } from "react-router-dom";
import { LogoGauchada } from "./LogoGauchada";

type LogoProps = {
  to?: string;
  className?: string;
};

export function Logo({ to = "/", className = "" }: LogoProps) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 group ${className}`}
    >
      <LogoGauchada className="w-8 h-8 text-sun-500 transition-transform duration-300 group-hover:scale-110" />
      <span className="font-display text-xl font-bold text-leather-900 leading-none">
        La Gauchada
        <span className="block text-xs font-sans font-medium tracking-wider text-leather-500 uppercase">
          Mates &amp; campo
        </span>
      </span>
    </Link>
  );
}
