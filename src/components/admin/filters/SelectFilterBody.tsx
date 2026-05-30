type SelectFilterOption<T extends string> = {
  value: T;
  label: string;
};

type SelectFilterBodyProps<T extends string> = {
  value: T | null;
  onChange: (value: T | null) => void;
  options: ReadonlyArray<SelectFilterOption<T>>;
  allLabel?: string;
  capitalize?: boolean;
};

/**
 * Contenido del popover para filtros de selección (uno entre varios).
 * Usa botones (no <select>) para integrarse mejor visualmente con el panel.
 */
export function SelectFilterBody<T extends string>({
  value,
  onChange,
  options,
  allLabel = "Todos",
  capitalize = false,
}: SelectFilterBodyProps<T>) {
  const base =
    "w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-colors";
  const active = "bg-leather-600 text-cream-50";
  const inactive = "text-leather-700 hover:bg-sepia-300/40";

  return (
    <div role="listbox" aria-label="Opciones" className="flex flex-col gap-0.5">
      <button
        type="button"
        role="option"
        aria-selected={value === null}
        onClick={() => onChange(null)}
        className={[base, value === null ? active : inactive].join(" ")}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="option"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            base,
            value === opt.value ? active : inactive,
            capitalize ? "capitalize" : "",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
