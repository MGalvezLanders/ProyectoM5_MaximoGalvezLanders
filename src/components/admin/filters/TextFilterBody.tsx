import { useEffect, useRef } from "react";

type TextFilterBodyProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * Contenido del popover para filtros de texto.
 * Auto-focusea el input al montar para que el usuario pueda tipear de inmediato.
 */
export function TextFilterBody({
  value,
  onChange,
  placeholder = "Buscar...",
}: TextFilterBodyProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md bg-cream-50 text-leather-900 placeholder-leather-500/60 border border-sepia-400 focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500 text-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs text-leather-600 hover:text-leather-900 hover:underline"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
