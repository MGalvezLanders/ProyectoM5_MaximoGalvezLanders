import { useState, type InputHTMLAttributes } from "react";

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
  type,
  ...inputProps
}: FormFieldProps) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const effectiveType = isPassword && showPassword ? "text" : type;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-leather-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={effectiveType}
          className={[
            "w-full px-3.5 py-2.5 rounded-lg bg-cream-50 text-leather-900 placeholder-leather-500/50",
            "border focus:outline-none focus:ring-2 transition-colors",
            isPassword ? "pr-11" : "",
            error
              ? "border-terracota-500 focus:ring-terracota-500/40"
              : "border-sepia-400 focus:ring-sun-500/50 focus:border-sun-500",
            className ?? "",
          ].join(" ")}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-leather-600 hover:text-leather-900 focus:outline-none focus:text-leather-900"
            tabIndex={0}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-terracota-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
