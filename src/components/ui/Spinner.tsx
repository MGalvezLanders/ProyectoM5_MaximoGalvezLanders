type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className = "w-6 h-6", label = "Cargando" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-2 border-sepia-400 border-t-leather-700 ${className}`}
    />
  );
}
