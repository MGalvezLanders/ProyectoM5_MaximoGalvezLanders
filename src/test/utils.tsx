import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/cart/CartContext";

type ProvidersOptions = Omit<RenderOptions, "wrapper"> & {
  /** Rutas iniciales del MemoryRouter (default: ["/"]). */
  initialEntries?: string[];
};

/**
 * Renderiza `ui` envuelto en los providers de la app: MemoryRouter > AuthProvider
 * > CartProvider. El orden importa: CartProvider usa useAuth() internamente.
 *
 * @example
 *   renderWithProviders(<ProductCard product={mockProduct} />);
 *   renderWithProviders(<CartPage />, { initialEntries: ["/cart"] });
 */
export function renderWithProviders(
  ui: ReactElement,
  { initialEntries = ["/"], ...renderOptions }: ProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-exportamos todo testing-library + userEvent para importar desde un solo lugar.
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
