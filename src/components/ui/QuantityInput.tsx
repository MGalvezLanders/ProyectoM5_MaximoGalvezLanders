type QuantityInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}: QuantityInputProps) {
  const clamp = (n: number) => Math.min(Math.max(n, min), max);
  const dec = () => onChange(clamp(value - 1));
  const inc = () => onChange(clamp(value + 1));

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!Number.isNaN(parsed)) onChange(clamp(parsed));
  };

  const btnClass =
    "w-9 h-9 inline-flex items-center justify-center text-leather-700 hover:bg-cream-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors";

  return (
    <div
      role="group"
      aria-label="Cantidad"
      className="inline-flex items-stretch border border-sepia-400 rounded-lg overflow-hidden bg-cream-50"
    >
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
        className={btnClass}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Cantidad"
        className="w-12 text-center bg-transparent text-leather-900 font-semibold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border-x border-sepia-300"
      />
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
        className={btnClass}
      >
        +
      </button>
    </div>
  );
}
