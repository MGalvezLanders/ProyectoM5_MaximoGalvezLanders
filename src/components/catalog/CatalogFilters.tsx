import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

export type PriceRange = "low" | "mid" | "high" | "premium";
export type SortBy = "default" | "price-asc" | "price-desc" | "newest";

export const CATEGORY_GROUPS = [
  { label: "Mates",      value: "mates" },
  { label: "Materas",    value: "materas" },
  { label: "Termos",     value: "termos" },
  { label: "Bombillas",  value: "bombillas" },
  { label: "Sombreros",  value: "sombreros" },
  { label: "Boinas",     value: "boinas" },
  { label: "Ponchos",    value: "ponchos" },
  { label: "Accesorios", value: "accesorios" },
] as const;

export const MATE_SUBTYPES = [
  { label: "Imperial",  value: "mate imperial" },
  { label: "Torpedo",   value: "mate torpedo" },
  { label: "Criollo",   value: "mate criollo" },
  { label: "Con pico",  value: "mate con pico" },
  { label: "Calabaza",  value: "mate de calabaza" },
  { label: "Artesanal", value: "mate artesanal" },
  { label: "De madera", value: "mate de madera" },
  { label: "De cuerno", value: "mate de cuerno" },
] as const;

const PRICE_RANGES = [
  { label: "Hasta $10k",  value: "low" as PriceRange },
  { label: "$10k – $25k", value: "mid" as PriceRange },
  { label: "$25k – $60k", value: "high" as PriceRange },
  { label: "Más de $60k", value: "premium" as PriceRange },
];

export interface CatalogFiltersProps {
  group: string | undefined;
  category: string | undefined;
  priceRange: PriceRange | undefined;
  onlyInStock: boolean;
  onGroupChange: (g: string | undefined) => void;
  onCategoryChange: (c: string | undefined) => void;
  onPriceRangeChange: (p: PriceRange | undefined) => void;
  onInStockChange: (v: boolean) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function CheckIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M1.5 6l3 3 6-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chip({
  label,
  active,
  onClick,
  disabled = false,
  badge,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-cream-50",
        disabled
          ? "opacity-50 cursor-not-allowed bg-cream-50 text-leather-400 border-sepia-200"
          : active
            ? "bg-leather-700 text-cream-50 border-leather-700 shadow-sm"
            : "bg-cream-50 text-leather-700 border-sepia-300 hover:border-leather-500 hover:text-leather-900 cursor-pointer",
      ].join(" ")}
    >
      {active && <CheckIcon />}
      {label}
      {badge && (
        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-sun-400/20 text-sun-700 leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-leather-400 mb-2 px-1">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function CatalogFilters({
  group,
  category,
  priceRange,
  onlyInStock,
  onGroupChange,
  onCategoryChange,
  onPriceRangeChange,
  onInStockChange,
  onClear,
  hasActiveFilters,
}: CatalogFiltersProps) {
  const handleGroupClick = (val: string) => {
    // Una sola llamada — el setter del padre limpia category cuando cambia el grupo.
    onGroupChange(group === val ? undefined : val);
  };

  return (
    <nav className="px-3 py-4 space-y-5">
      {/* Categorías */}
      <Section title="Categoría">
        <Chip
          label="Todos"
          active={!group}
          onClick={() => onGroupChange(undefined)}
        />
        {CATEGORY_GROUPS.map((g) => (
          <Chip
            key={g.value}
            label={g.label}
            active={group === g.value}
            onClick={() => handleGroupClick(g.value)}
          />
        ))}
      </Section>

      {/* Tipos de mate — aparece animado */}
      <AnimatePresence>
        {group === "mates" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <Section title="Tipo de mate">
              {MATE_SUBTYPES.map((m) => (
                <Chip
                  key={m.value}
                  label={m.label}
                  active={category === m.value}
                  onClick={() =>
                    onCategoryChange(category === m.value ? undefined : m.value)
                  }
                />
              ))}
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Precio */}
      <Section title="Precio">
        {PRICE_RANGES.map((p) => (
          <Chip
            key={p.value}
            label={p.label}
            active={priceRange === p.value}
            onClick={() =>
              onPriceRangeChange(priceRange === p.value ? undefined : p.value)
            }
          />
        ))}
      </Section>

      {/* Más */}
      <Section title="Más filtros">
        <Chip
          label="Solo en stock"
          active={onlyInStock}
          onClick={() => onInStockChange(!onlyInStock)}
        />
        <Chip
          label="En oferta"
          active={false}
          onClick={() => {}}
          disabled
          badge="Pronto"
        />
      </Section>

      {/* Limpiar */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-terracota-500 border border-terracota-300 hover:bg-terracota-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
          Limpiar filtros
        </button>
      )}
    </nav>
  );
}
