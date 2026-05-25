import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { User as FirebaseUser } from "firebase/auth";
import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/cart/CartContext";

type ProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** Rutas iniciales del MemoryRouter (default: ["/"]). */
  initialEntries?: string[];
  /**
   * Si se pasa, omite AuthProvider y expone directamente el usuario
   * mockeado a través de AuthContext. Útil para tests que necesitan un
   * usuario autenticado sin pasar por Firebase.
   * - `undefined` (default): usa el AuthProvider real (usuario = null vía mock)
   * - `null`: AuthContext con usuario null
   * - objeto: AuthContext con ese usuario
   */
  mockUser?: Partial<FirebaseUser> | null;
};

/**
 * Renderiza `ui` envuelto en los providers de la app: MemoryRouter > AuthProvider
 * > CartProvider. El orden importa: CartProvider usa useAuth() internamente.
 *
 * @example
 *   renderWithProviders(<ProductCard product={mockProduct} />);
 *   renderWithProviders(<CartPage />, { initialEntries: ["/cart"] });
 *   renderWithProviders(<ProductCard product={p} />, { mockUser: mockFirebaseUser });
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ["/"], mockUser, ...renderOptions }: ProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    const cart = <CartProvider>{children}</CartProvider>;

    if (mockUser !== undefined) {
      return (
        <MemoryRouter initialEntries={initialEntries}>
          <AuthContext.Provider
            value={{
              user: mockUser as FirebaseUser | null,
              profile: null,
              loading: false,
              login: async () => {},
              register: async () => {},
              loginWithGoogle: async () => {},
              logout: async () => {},
              updateName: async () => {},
              changePassword: async () => {},
            }}
          >
            {cart}
          </AuthContext.Provider>
        </MemoryRouter>
      );
    }

    return (
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          {cart}
        </AuthProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-exportamos todo testing-library + userEvent para importar desde un solo lugar.
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
