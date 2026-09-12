import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/button/Button";
import { useFavorites } from "@/hooks/useFavorites";
import { CartBadge } from "./CartBadge";
import type { UserProfile } from "@/types/auth";
import type { User } from "firebase/auth";

type NavbarMobileMenuProps = {
  isOpen: boolean;
  user: User | null;
  profile: UserProfile | null;
  cartCount: number;
  categories: string[];
  onLogout: () => void;
  onRegister: () => void;
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block px-3 py-3 rounded-lg text-base font-medium transition-colors",
    isActive
      ? "bg-cream-200 text-leather-900"
      : "text-leather-700 hover:bg-cream-100",
  ].join(" ");

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function NavbarMobileMenu({
  isOpen,
  user,
  profile,
  cartCount,
  categories,
  onLogout,
  onRegister,
}: NavbarMobileMenuProps) {
  const [productsOpen, setProductsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { count: favCount } = useFavorites();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/catalog?q=${encodeURIComponent(q)}`);
    setQuery("");
  };

  return (
    <div
      id="mobile-menu"
      className={[
        "md:hidden overflow-hidden border-t border-sepia-300 bg-cream-50 transition-[max-height,opacity] duration-200 ease-out",
        isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
      ].join(" ")}
    >
      <div className="px-4 py-3 flex flex-col gap-1">
        {/* Buscador global */}
        <form onSubmit={handleSubmit} className="mb-2">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-cream-50 text-leather-900 placeholder-leather-500/60 border border-sepia-400 text-sm focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          </div>
        </form>

        {user && (
          <div className="px-3 py-2 mb-1 border-b border-sepia-300/60">
            <p className="text-xs uppercase tracking-wider text-leather-500">
              Sesión iniciada
            </p>
            <p className="text-sm font-semibold text-leather-900 truncate">
              {profile?.name || user.email}
            </p>
          </div>
        )}

        {/* Sección Productos expandible */}
        <div>
          <button
            onClick={() => setProductsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-leather-700 hover:bg-cream-100 transition-colors"
          >
            Productos
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${productsOpen ? "rotate-180" : ""}`}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div
            className={[
              "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
              productsOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="pl-4 pb-2 flex flex-col gap-0.5">
              <Link
                to="/catalog"
                onClick={() => setProductsOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-leather-900 hover:bg-cream-100 transition-colors"
              >
                Ver todos los productos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/catalog?category=${encodeURIComponent(cat)}`}
                  onClick={() => setProductsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-leather-700 hover:bg-cream-100 transition-colors capitalize"
                >
                  {capitalize(cat)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <NavLink to="/favorites" className={linkClass}>
          Favoritos
          {favCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold rounded-full bg-terracota-500 text-cream-50">
              {favCount}
            </span>
          )}
        </NavLink>

        {user && (
          <>
            <NavLink to="/cart" className={linkClass}>
              Carrito
              <CartBadge count={cartCount} />
            </NavLink>
            <NavLink to="/orders" className={linkClass}>
              Mis pedidos
            </NavLink>
            <NavLink to="/profile" className={linkClass}>
              Mi perfil
            </NavLink>
            {profile?.role === "admin" && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
            <div className="pt-2 mt-1 border-t border-sepia-300/60">
              <Button variant="outline" fullWidth onClick={onLogout}>
                Cerrar sesión
              </Button>
            </div>
          </>
        )}

        {!user && (
          <>
            <NavLink to="/login" className={linkClass}>
              Iniciar sesión
            </NavLink>
            <div className="pt-2 mt-1 border-t border-sepia-300/60">
              <Button fullWidth onClick={onRegister}>
                Registrarse
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
