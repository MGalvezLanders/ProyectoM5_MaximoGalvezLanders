import { Link, useNavigate } from "react-router-dom";

type Variant = "backCatalog" | "backHome" | "back";
type BackButtonProps = {
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
};

const ROUTES: Record<Variant, string | null> = {
  backCatalog: "/catalog",
  backHome: "/",
  back: null,
};

const BASE =
  "inline-flex items-center gap-1.5 px-3 py-1.5 -ml-3 rounded-full text-sm font-medium " +
  "text-leather-600 hover:text-leather-900 hover:bg-cream-200 " +
  "transition-all duration-150 group";

function ArrowIcon() {
  return (
    <svg
      className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export function BackButton({
  variant = "backCatalog",
  children,
  className = "",
}: BackButtonProps) {
  const navigate = useNavigate();

  if (variant === "back") {
    return (
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={`${BASE} ${className}`}
      >
        <ArrowIcon />
        {children}
      </button>
    );
  }

  return (
    <Link to={ROUTES[variant]!} className={`${BASE} ${className}`}>
      <ArrowIcon />
      {children}
    </Link>
  );
}
