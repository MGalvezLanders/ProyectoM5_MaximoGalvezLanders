type Props = {
  value: number;
  /** Tamaño en px del ancho/alto de cada estrella. */
  size?: number;
  className?: string;
};

/**
 * Rating de 5 estrellas con soporte para medias (usa clip-path para llenar
 * fraccionalmente). No es interactivo — solo display.
 */
export function StarRating({ value, size = 14, className = "" }: Props) {
  const pct = Math.max(0, Math.min(5, value)) / 5;

  return (
    <span
      className={`relative inline-flex ${className}`}
      role="img"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
      style={{ width: size * 5, height: size }}
    >
      {/* Fondo: 5 estrellas grises */}
      <span className="absolute inset-0 flex text-sepia-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={size} />
        ))}
      </span>
      {/* Frente: 5 estrellas amarillas recortadas al pct */}
      <span
        className="absolute inset-0 flex text-sun-500 overflow-hidden"
        style={{ width: `${pct * 100}%` }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={size} />
        ))}
      </span>
    </span>
  );
}

function Star({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M10 1.5l2.6 5.4 6 .8-4.3 4.2 1 5.9L10 15l-5.3 2.8 1-5.9L1.4 7.7l6-.8L10 1.5z" />
    </svg>
  );
}
