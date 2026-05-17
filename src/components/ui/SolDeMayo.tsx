type SolDeMayoProps = {
  className?: string;
  title?: string;
};

/**
 * Sol de Mayo estilizado, usado como marca decorativa.
 * Por defecto hereda el color con `currentColor`.
 */
export function SolDeMayo({ className, title = "Sol de Mayo" }: SolDeMayoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <g fill="currentColor">
        {/* Rayos: 16 alternados (rectos y ondulados simplificados) */}
        {Array.from({ length: 16 }).map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <rect
              key={i}
              x="48.5"
              y="4"
              width="3"
              height="22"
              rx="1.2"
              transform={`rotate(${angle} 50 50)`}
            />
          );
        })}
        {/* Cara central */}
        <circle cx="50" cy="50" r="16" />
      </g>
      <g fill="var(--color-cream-50)">
        <circle cx="44" cy="48" r="1.6" />
        <circle cx="56" cy="48" r="1.6" />
        <path
          d="M44 56 Q50 60 56 56"
          stroke="var(--color-cream-50)"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
