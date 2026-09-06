import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/cart/useCart";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/button/Button";
import { CartBadge } from "./CartBadge";
import { NavbarMobileMenu } from "./NavbarMobileMenu";
import { ProductsMegaMenu } from "./ProductsMegaMenu";
import { getCategories } from "@/services/product/products.service";

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "text-sm font-medium transition-colors px-1 py-0.5 border-b-2",
    isActive
      ? "text-leather-900 border-sun-500"
      : "text-leather-600 border-transparent hover:text-leather-900 hover:border-sepia-400",
  ].join(" ");

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const { state: cartState } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = cartState.items.reduce(
    (acc, item) => acc + item.quantity,
    0
  );
  const isProductsActive = location.pathname === "/catalog";

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Cerrar todo al cambiar de ruta
  useEffect(() => {
    setIsOpen(false);
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useBodyScrollLock(isOpen);

  // Mega menu hover
  const openMenu = () => {
    clearTimeout(closeTimerRef.current);
    setMenuOpen(true);
  };
  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setMenuOpen(false), 200);
  };
  const closeMenu = () => {
    clearTimeout(closeTimerRef.current);
    setMenuOpen(false);
  };

  // Escape cierra ambos dropdowns
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Click fuera cierra el user dropdown
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    setUserMenuOpen(false);
    await logout();
    navigate("/login");
  };

  const handleRegister = () => {
    setIsOpen(false);
    navigate("/register");
  };

  const displayName = profile?.name || user?.email || "";

  return (
    <header className="sticky top-0 z-40 relative">
      {/* Franja patria decorativa */}
      <div className="h-1 band-argentina opacity-70" />

      <nav className="bg-cream-50/95 backdrop-blur border-b border-sepia-300">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center">

          {/* Izquierda: Logo */}
          <div className="flex-1 flex items-center">
            <Logo />
          </div>

          {/* Centro: Links de escritorio */}
          <div className="hidden md:flex items-center gap-6">
            <div onMouseEnter={openMenu} onMouseLeave={scheduleClose}>
              <Link
                to="/catalog"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className={[
                  "flex items-center gap-1 text-sm font-medium transition-colors px-1 py-0.5 border-b-2",
                  isProductsActive || menuOpen
                    ? "text-leather-900 border-sun-500"
                    : "text-leather-600 border-transparent hover:text-leather-900 hover:border-sepia-400",
                ].join(" ")}
              >
                Productos
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {user && (
              <>
                <NavLink to="/cart" className={desktopLinkClass}>
                  Carrito
                  <CartBadge count={cartCount} animated />
                </NavLink>
                <NavLink to="/orders" className={desktopLinkClass}>
                  Mis pedidos
                </NavLink>
                {profile?.role === "admin" && (
                  <NavLink to="/admin" className={desktopLinkClass}>
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </div>

          {/* Derecha: auth */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-3">
            {user ? (
              /* User dropdown */
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-leather-900 hover:text-leather-700 transition-colors"
                >
                  {displayName}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 w-52 bg-cream-50 border border-sepia-300 rounded-xl shadow-warm-lg z-50 overflow-hidden"
                    >
                      {/* Cabecera */}
                      <div className="px-4 py-3 border-b border-sepia-300/60">
                        <p className="text-sm font-semibold text-leather-900 truncate">
                          {profile?.name || "Mi cuenta"}
                        </p>
                        <p className="text-xs text-leather-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      {/* Opciones */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-leather-700 hover:bg-cream-100 transition-colors"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.25" />
                            <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                          </svg>
                          Mi perfil
                        </Link>

                        <div className="my-1 h-px bg-sepia-300/60 mx-3" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-terracota-500 hover:bg-cream-100 transition-colors"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
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

          {/* Burger (mobile) */}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>

        <NavbarMobileMenu
          isOpen={isOpen}
          user={user}
          profile={profile}
          cartCount={cartCount}
          categories={categories}
          onLogout={handleLogout}
          onRegister={handleRegister}
        />
      </nav>

      {/* Mega menu de productos */}
      <AnimatePresence>
        {menuOpen && (
          <ProductsMegaMenu
            categories={categories}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onLinkClick={closeMenu}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
