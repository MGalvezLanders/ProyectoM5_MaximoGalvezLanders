import { NavLink } from "react-router-dom";
import { Button } from "@/components/button/Button";
import { CartBadge } from "./CartBadge";
import type { UserProfile } from "@/types/auth";
import type { User } from "firebase/auth";

type NavbarMobileMenuProps = {
  isOpen: boolean;
  user: User | null;
  profile: UserProfile | null;
  cartCount: number;
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

/**
 * Panel mobile del Navbar. Se separó del componente principal porque tenía
 * lógica de auth + links + scroll lock + Cierre que aumentaba mucho el LOC
 * de la cabecera.
 */
export function NavbarMobileMenu({
  isOpen,
  user,
  profile,
  cartCount,
  onLogout,
  onRegister,
}: NavbarMobileMenuProps) {
  return (
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
            <NavLink to="/catalog" className={linkClass}>
              Catálogo
            </NavLink>
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
        ) : (
          <>
            <NavLink to="/catalog" className={linkClass}>
              Catálogo
            </NavLink>
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
