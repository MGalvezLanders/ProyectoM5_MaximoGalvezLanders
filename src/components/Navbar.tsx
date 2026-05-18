import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate("/login");
  };

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "text-sm font-medium transition-colors px-1 py-0.5 border-b-2",
      isActive
        ? "text-leather-900 border-sun-500"
        : "text-leather-600 border-transparent hover:text-leather-900 hover:border-sepia-400",
    ].join(" ");

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block px-3 py-3 rounded-lg text-base font-medium transition-colors",
      isActive
        ? "bg-cream-200 text-leather-900"
        : "text-leather-700 hover:bg-cream-100",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40">
      {/* Franja patria decorativa */}
      <div className="h-1 band-argentina opacity-70" />

      <nav className="bg-cream-50/95 backdrop-blur border-b border-sepia-300">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Logo />

          {/* Links de escritorio */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <NavLink to="/catalog" className={desktopLinkClass}>
                  Catálogo
                </NavLink>
                <NavLink to="/cart" className={desktopLinkClass}>
                  Carrito
                </NavLink>
                <NavLink to="/orders" className={desktopLinkClass}>
                  Mis pedidos
                </NavLink>
                {profile?.role === "admin" && (
                  <NavLink to="/admin" className={desktopLinkClass}>
                    Admin
                  </NavLink>
                )}
                <Link
                  to="/profile"
                  className="text-sm font-semibold text-leather-900 hover:text-leather-700 transition-colors"
                >
                  {profile?.name || user.email}
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/catalog" className={desktopLinkClass}>
                  Catálogo
                </NavLink>
                <Link
                  to="/login"
                  className="text-sm text-leather-600 hover:text-leather-900 transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Button onClick={() => navigate("/register")} size="sm">
                  Registrarse
                </Button>
              </>
            )}
          </div>

          {/* Botón burger (mobile) */}
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-lg text-leather-700 hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50 transition-colors"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 7h16M4 12h16M4 17h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Panel mobile */}
        <div
          id="mobile-menu"
          className={[
            "md:hidden overflow-hidden border-t border-sepia-300 bg-cream-50 transition-[max-height,opacity] duration-200 ease-out",
            isOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="px-4 py-3 flex flex-col gap-1">
            {user ? (
              <>
                <div className="px-3 py-2 mb-1 border-b border-sepia-300/60">
                  <p className="text-xs uppercase tracking-wider text-leather-500">
                    Sesión iniciada
                  </p>
                  <p className="text-sm font-semibold text-leather-900 truncate">
                    {profile?.name || user.email}
                  </p>
                </div>
                <NavLink to="/catalog" className={mobileLinkClass}>
                  Catálogo
                </NavLink>
                <NavLink to="/cart" className={mobileLinkClass}>
                  Carrito
                </NavLink>
                <NavLink to="/orders" className={mobileLinkClass}>
                  Mis pedidos
                </NavLink>
                <NavLink to="/profile" className={mobileLinkClass}>
                  Mi perfil
                </NavLink>
                {profile?.role === "admin" && (
                  <NavLink to="/admin" className={mobileLinkClass}>
                    Admin
                  </NavLink>
                )}
                <div className="pt-2 mt-1 border-t border-sepia-300/60">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/catalog" className={mobileLinkClass}>
                  Catálogo
                </NavLink>
                <NavLink to="/login" className={mobileLinkClass}>
                  Iniciar sesión
                </NavLink>
                <div className="pt-2 mt-1 border-t border-sepia-300/60">
                  <Button
                    fullWidth
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/register");
                    }}
                  >
                    Registrarse
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
