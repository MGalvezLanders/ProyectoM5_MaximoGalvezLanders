import { describe, it, expect } from "vitest";
import { act, screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/utils";
import CartPage from "../../pages/CartPage";
import { useCart } from "@/hooks/useCart";
import { mockProduct } from "@/test/fixtures";

// Capturamos la API del carrito para sembrar items DESPUÉS del montaje,
// evitando la carrera con el efecto de hidratación de CartProvider (que
// dispara CLEAR_CART al montar con usuario deslogueado).
let cart: ReturnType<typeof useCart>;
function CaptureCart() {
  cart = useCart();
  return null;
}

describe("<CartPage /> (render de items del carrito)", () => {
  it("muestra el item agregado con su nombre y subtotal", () => {
    renderWithProviders(
      <>
        <CaptureCart />
        <CartPage />
      </>,
    );

    act(() => cart.addItem(mockProduct));

    expect(screen.getByText("Mate Imperial")).toBeInTheDocument();
    expect(screen.getByText(/c\/u/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Finalizar compra/i }),
    ).toBeInTheDocument();
  });

  it("permite quitar un item, dejando el carrito vacío", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <CaptureCart />
        <CartPage />
      </>,
    );

    act(() => cart.addItem(mockProduct));

    await user.click(
      screen.getByRole("button", { name: /Quitar Mate Imperial del carrito/i }),
    );

    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
  });
});
