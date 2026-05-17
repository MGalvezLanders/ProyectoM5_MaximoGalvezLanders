import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export function FormField({
  id,
  label,
  error,
  className,
  ...inputProps
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-leather-700 mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        className={[
          "w-full px-3.5 py-2.5 rounded-lg bg-cream-50 text-leather-900 placeholder-leather-500/50",
          "border focus:outline-none focus:ring-2 transition-colors",
          error
            ? "border-terracota-500 focus:ring-terracota-500/40"
            : "border-sepia-400 focus:ring-sun-500/50 focus:border-sun-500",
          className ?? "",
        ].join(" ")}
        {...inputProps}
      />
      {error && (
        <p className="mt-1 text-sm text-terracota-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
