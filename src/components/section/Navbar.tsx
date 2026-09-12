import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/cart/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/button/Button";
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
  const { count: favCount } = useFavorites();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
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
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/catalog?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

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
      {/* Franja utilitaria — liviana, sobre cream con acentos leather */}
      <div className="bg-cream-100 border-b border-sepia-300/60 text-[11px] sm:text-xs text-leather-700">
        <div className="px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-leather-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 16V7h10v9M13 10h4l3 4v2h-7" />
              <circle cx="7" cy="18" r="1.6" />
              <circle cx="17" cy="18" r="1.6" />
            </svg>
            Envío a todo el país
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="font-bold text-sun-700 tracking-wide">10% OFF</span>
            pagando por transferencia
          </span>
        </div>
      </div>

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

          {/* Derecha: search + cart icon + auth */}
          <div className="flex-1 hidden md:flex items-center justify-end gap-2">
            {/* Buscador global */}
            <div className="relative">
              <AnimatePresence initial={false} mode="wait">
                {searchOpen ? (
                  <motion.form
                    key="search-form"
                    onSubmit={handleSearchSubmit}
                    initial={{ width: 40, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 40, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden"
                  >
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => !searchQuery && setSearchOpen(false)}
                      placeholder="Buscar productos..."
                      aria-label="Buscar productos"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-cream-50 text-leather-900 placeholder-leather-500/60 border border-sepia-400 text-sm focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-leather-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                    </svg>
                  </motion.form>
                ) : (
                  <motion.button
                    key="search-btn"
                    type="button"
                    onClick={() => setSearchOpen(true)}
                    aria-label="Abrir buscador"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-leather-700 hover:bg-cream-100 hover:text-leather-900 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <NavLink
              to="/favorites"
              aria-label={`Favoritos${favCount > 0 ? ` (${favCount})` : ""}`}
              className={({ isActive }) =>
                [
                  "relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                  isActive
                    ? "bg-cream-200 text-leather-900"
                    : "text-leather-700 hover:bg-cream-100 hover:text-leather-900",
                ].join(" ")
              }
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-8-4.5-8-11a5 5 0 018-3.5A5 5 0 0120 10c0 6.5-8 11-8 11z" />
              </svg>
              {favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-terracota-500 text-cream-50 text-[10px] font-bold ring-2 ring-cream-50">
                  {favCount > 99 ? "99+" : favCount}
                </span>
              )}
            </NavLink>

            {user && (
              <NavLink
                to="/cart"
                aria-label={`Carrito (${cartCount} ${cartCount === 1 ? "producto" : "productos"})`}
                className={({ isActive }) =>
                  [
                    "relative inline-flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                    isActive
                      ? "bg-cream-200 text-leather-900"
                      : "text-leather-700 hover:bg-cream-100 hover:text-leather-900",
                  ].join(" ")
                }
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 3h2l2.4 12.3a2 2 0 002 1.7h8.6a2 2 0 002-1.6L21 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="20" r="1.4" fill="currentColor" />
                  <circle cx="17" cy="20" r="1.4" fill="currentColor" />
                </svg>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 14 }}
                    className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-sun-500 text-leather-900 text-[10px] font-bold ring-2 ring-cream-50"
                    aria-hidden="true"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </NavLink>
            )}
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

          {/* Cart icon (mobile) */}
          {user && (
            <Link
              to="/cart"
              aria-label={`Carrito (${cartCount} ${cartCount === 1 ? "producto" : "productos"})`}
              className="md:hidden relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-leather-700 hover:bg-cream-100 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 3h2l2.4 12.3a2 2 0 002 1.7h8.6a2 2 0 002-1.6L21 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="20" r="1.4" fill="currentColor" />
                <circle cx="17" cy="20" r="1.4" fill="currentColor" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-sun-500 text-leather-900 text-[10px] font-bold ring-2 ring-cream-50">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

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
