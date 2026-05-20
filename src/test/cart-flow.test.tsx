import { describe, it, expect } from "vitest";
import { Routes, Route } from "react-router-dom";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/utils";
import { ProductCard } from "@/components/ProductCard";
import CartPage from "@/pages/CartPage";
import { mockProduct } from "@/test/fixtures";

// Test de integración del flujo:
//   agregar al carrito (ProductCard) → ver carrito (CartPage) → checkout
function TestApp() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <ProductCard product={mockProduct} />
            <CartPage />
          </>
        }
      />
      <Route path="/checkout" element={<h1>Página de checkout</h1>} />
    </Routes>
  );
}

describe("flujo agregar al carrito → ver carrito → checkout", () => {
  it("recorre el flujo completo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { initialEntries: ["/"] });

    // 1) Arranca con el carrito vacío.
    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();

    // 2) Agregar al carrito desde la card del producto.
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    // 3) El carrito ahora muestra el resumen y el botón de checkout.
    const checkoutBtn = await screen.findByRole("button", {
      name: /Finalizar compra/i,
    });
    expect(screen.getByText("Resumen")).toBeInTheDocument();

    // 4) Ir al checkout.
    await user.click(checkoutBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Página de checkout/i }),
      ).toBeInTheDocument();
    });
  });
});
