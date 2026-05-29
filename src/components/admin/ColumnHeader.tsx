import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";

type Align = "left" | "right";

type ColumnHeaderProps = {
  label: string;
  align?: Align;
  /** Si hay un valor activo, se muestra el indicador y el botón de limpiar. */
  filterActive?: boolean;
  /** Callback opcional para limpiar el filtro desde el header. */
  onClear?: () => void;
  /** Contenido del popover (TextFilterBody, SelectFilterBody, etc.). */
  children: ReactNode;
};

/**
 * Cabecera de columna con popover de filtro.
 *
 * Single Responsibility: solo se encarga de la UI del header (label + ícono +
 * popover + click-outside). El contenido del filtro (text/select/etc.) lo
 * inyecta el page a través de `children`, manteniendo el componente abierto
 * a extensión sin modificarlo.
 */
export function ColumnHeader({
  label,
  align = "left",
  filterActive = false,
  onClear,
  children,
}: ColumnHeaderProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  //* Cerrar al hacer click afuera o al apretar Escape.
  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
    setOpen(false);
  };

  return (
    <div
      className={`relative inline-flex items-center gap-1 ${
        align === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={popoverId}
        className={[
          "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 -mx-1.5",
          "text-leather-600 hover:text-leather-900 hover:bg-sepia-300/40",
          "transition-colors font-medium",
          filterActive ? "text-leather-900" : "",
        ].join(" ")}
      >
        <span>{label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={[
            "w-3.5 h-3.5 transition-colors",
            filterActive ? "text-sun-600" : "text-leather-500/60",
          ].join(" ")}
          aria-hidden="true"
        >
          {filterActive ? (
            //* Embudo lleno → indica filtro activo.
            <path
              d="M3 4h18l-7 9v6l-4 2v-8L3 4z"
              fill="currentColor"
              stroke="currentColor"
            />
          ) : (
            //* Embudo vacío.
            <path d="M3 4h18l-7 9v6l-4 2v-8L3 4z" />
          )}
        </svg>
      </button>

      {filterActive && onClear && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={`Limpiar filtro de ${label}`}
          className="w-4 h-4 inline-flex items-center justify-center rounded-full text-leather-500 hover:bg-sepia-300/60 hover:text-leather-900 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="w-2.5 h-2.5"
            aria-hidden="true"
          >
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            id={popoverId}
            ref={popoverRef}
            role="dialog"
            aria-label={`Filtro de ${label}`}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={[
              "absolute top-full mt-2 z-30 min-w-[14rem] max-w-xs",
              "bg-cream-50 border border-sepia-400 rounded-lg shadow-xl shadow-leather-900/10 p-3",
              align === "right" ? "right-0" : "left-0",
            ].join(" ")}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
