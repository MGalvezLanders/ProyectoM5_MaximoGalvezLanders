import { useId } from "react";
import { motion } from "motion/react";

type SolDeMayoProps = {
  className?: string;
  title?: string;
  /** false: estático. true: gira en 60s. number: duración custom en segundos. */
  spin?: boolean | number;
};

/**
 * Sol de Mayo oficial basado en el SVG de la bandera argentina (Wikipedia).
 * Colores hardcodeados (#f6b40e oro, #85340a marrón) para fidelidad visual.
 * Con `spin`, solo rotan los rayos: la cara queda fija.
 */
export function SolDeMayo({
  className,
  title = "Sol de Mayo",
  spin = false,
}: SolDeMayoProps) {
  // IDs únicos por instancia para evitar colisiones en <defs>
  const uid = useId().replace(/:/g, "x");
  const R1 = `r1${uid}`;
  const R2 = `r2${uid}`;
  const UP = `up${uid}`;
  const LP = `lp${uid}`;
  const PU = `pu${uid}`;
  const EC = `ec${uid}`;
  const EB = `eb${uid}`;

  const duration = typeof spin === "number" ? spin : 60;

  const rays = ([0, 90, 180, 270] as const).map((rot) => (
    <g key={rot} transform={`rotate(${rot} 400 250)`}>
      {([0, 22.5, 45, 67.5] as const).map((r) => (
        <g key={r} transform={r ? `rotate(${r} 400 250)` : undefined}>
          <use href={`#${R1}`} />
          <use href={`#${R2}`} />
        </g>
      ))}
    </g>
  ));

  return (
    <svg
      className={className}
      viewBox="325 175 150 150"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        {/* Rayo principal (forma lanceolada + detalle sinusoidal) */}
        <path
          id={R1}
          strokeWidth="1.1116"
          stroke="#85340a"
          fill="#f6b40e"
          d="m396.84 251.31 28.454 61.992s0.4896 1.185 1.28 0.8586c0.7902-0.3267 0.2988-1.5116 0.2988-1.5116l-23.715-63.956m-0.68 24.12c-0.3465 9.4278 5.4526 14.613 4.6943 23.032-0.7569 8.42 3.8673 13.18 4.9396 16.454 1.0733 3.2744-1.16 5.2323-0.198 5.6982 0.96336 0.4662 3.07-2.1207 2.3833-6.7756-0.68675-4.6549-4.2204-6.0368-3.3898-16.32 0.83-10.283-4.206-12.678-2.98-22.058"
        />
        {/* Detalle oscuro sobre el rayo */}
        <path
          id={R2}
          fill="#85340a"
          d="m404.31 274.41c0.45334 9.0538 5.5867 13.063 4.5787 21.314 2.2133-6.5249-3.1233-11.583-2.82-21.22m-7.6487-23.757 19.487 42.577-16.329-43.887"
        />
        {/* Párpado superior */}
        <path
          id={UP}
          fill="#85340a"
          d="m390.42 242.74c2.7767 0 3.4186 0.6417 4.7007 1.71 1.2833 1.0683 1.9233 0.8541 2.1367 1.0683 0.2124 0.2142 0 0.8541-0.4266 0.6399s-1.2833-0.6399-2.5633-1.7086c-1.2833-1.0696-2.5633-1.0683-3.8463-1.0683-3.8463 0-5.983 3.2046-6.4094 2.9907-0.4266-0.2142 2.1367-3.6325 6.4094-3.6325z"
        />
        {/* Párpado inferior */}
        <path
          id={LP}
          fill="#85340a"
          d="m385.29 247.44c3.6327 2.7783 7.265 2.5644 9.4017 1.282 2.1367-1.282 2.1367-1.7086 1.71-1.7086-0.4266 0-0.8532 0.4266-2.5633 1.281-1.71 0.8559-4.273 0.8559-8.546-0.8541z"
        />
        {/* Pupila */}
        <circle id={PU} cy="246.15" cx="390.54" r="1.923" fill="#85340a" />
        {/* Contorno del ojo (se usa para los dos ojos, espejado) */}
        <path
          id={EC}
          fill="#85340a"
          d="m409.47 244.06c-1.8967 0.00003-3.7131 0.82183-4.7812 2.5312 2.1367 1.9227 6.8565 2.1318 10.062-0.21875-1.3883-1.4954-3.3845-2.3125-5.2812-2.3125zm-0.0312 0.4375c1.8462-0.0335 3.5717 0.81446 3.8125 1.6562-2.1367 2.3504-5.5508 2.1463-7.6875 0.4375 0.9348-1.4957 2.4391-2.0677 3.875-2.0938z"
        />
        {/* Ceja + costado de la nariz (se usa para los dos ojos, espejado) */}
        <path
          id={EB}
          fill="#85340a"
          d="m382.73 244.02c4.9146-4.2729 11.11-4.9147 14.53-1.7086 0.837 1.1207 1.3733 2.319 1.5934 3.5696 0.4302 2.433-0.3303 5.0617-2.2367 7.7559 0.2151-0.001 0.6435 0.2124 0.8568 0.4266 1.6967-3.244 2.2967-6.5761 1.74-9.7454-0.1458-0.828-0.3735-1.643-0.6696-2.4357-4.7007-3.8452-11.11-4.2729-15.811 2.1377z"
        />
      </defs>

      {/* ── 32 rayos: 4 grupos de 8, cada grupo girado 90° ── */}
      {spin ? (
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
        >
          {rays}
        </motion.g>
      ) : (
        <g>{rays}</g>
      )}

      {/* ── Disco central ── */}
      <circle r="27.778" stroke="#85340a" cy="250" cx="400" strokeWidth="1.5" fill="#f6b40e" />

      {/* ── Cara (siempre fija) ── */}

      {/* Contornos de los dos ojos (espejados para simetría) */}
      <use href={`#${EC}`} />
      <use href={`#${EC}`} transform="matrix(-1 0 0 1 800.25 0)" />

      {/* Párpados superiores (izq + espejo der) */}
      <use href={`#${UP}`} />
      <use href={`#${UP}`} transform="matrix(-1 0 0 1 800.25 0)" />

      {/* Cejas + nariz (izq + espejo der) */}
      <use href={`#${EB}`} />
      <use href={`#${EB}`} transform="matrix(-1 0 0 1 800.25 0)" />

      {/* Párpados inferiores (izq + espejo der) */}
      <use href={`#${LP}`} />
      <use href={`#${LP}`} transform="matrix(-1 0 0 1 800.25 0)" />

      {/* Pupilas (izq + der) */}
      <use href={`#${PU}`} />
      <use href={`#${PU}`} transform="translate(18.862 0)" />

      {/* Boca — tres capas */}
      <path
        fill="#85340a"
        d="m395.75 253.84c-0.91341 0.16668-1.5625 0.97727-1.5625 1.9062 0 1.0614 0.87748 1.9062 1.9375 1.9062 0.62667 0 1.2025-0.2968 1.5625-0.8125 0.73952 0.55614 1.7646 0.61511 2.3125 0.625 0.0843 0.002 0.19312 0 0.25 0 0.54791-0.01 1.573-0.0689 2.3125-0.625 0.36 0.5157 0.93583 0.8125 1.5625 0.8125 1.06 0 1.9375-0.84488 1.9375-1.9062 0-0.92898-0.64918-1.7396-1.5625-1.9062 0.513 0.1809 0.84375 0.6765 0.84375 1.2188 0 0.7074-0.57124 1.2812-1.2812 1.2812-0.6804 0-1.2413-0.54015-1.2812-1.2188-0.20862 0.41637-1.0341 1.6551-2.6562 1.7188-1.6222-0.0636-2.4476-1.3024-2.6562-1.7188-0.04 0.6786-0.60085 1.2188-1.2812 1.2188-0.71001 0-1.2812-0.57385-1.2812-1.2812 0-0.54225 0.33075-1.0378 0.84375-1.2188z"
      />
      <path
        fill="#85340a"
        d="m397.84 259.53c-2.138 0-2.9829 1.9368-4.9062 3.2188 1.0687-0.42633 1.9096-1.2693 3.4062-2.125 1.496-0.85442 2.7717 0.1875 3.625 0.1875h0.0312c0.8532 0 2.129-1.0416 3.625-0.1875 1.4967 0.8559 2.3688 1.6987 3.4375 2.125-1.9233-1.282-2.7996-3.2188-4.9375-3.2188-0.4266 0-1.2716 0.23055-2.125 0.65625h-0.0312c-0.85334-0.42642-1.6983-0.65625-2.125-0.65625z"
      />
      <path
        fill="#85340a"
        d="m397.12 262.06c-0.8439 0.0374-1.9596 0.20675-3.5625 0.6875 3.8473-0.85434 4.6962 0.4375 6.4062 0.4375h0.0312c1.71 0 2.5588-1.292 6.4062-0.4375-4.2744-1.282-5.1242-0.4375-6.4062-0.4375h-0.0312c-0.80125 0-1.4372-0.3124-2.8438-0.25z"
      />
    </svg>
  );
}
