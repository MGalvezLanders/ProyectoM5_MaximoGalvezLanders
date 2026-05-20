import { describe, it, expect } from "vitest";
import { act, screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/utils";
import CartPage from "@/pages/cart/CartPage";
import { useCart } from "@/hooks/useCart";
import { mockProduct, makeProduct } from "@/test/fixtures";

// CartItem no está extraído como componente separado: vive inline en CartPage.
// Estos tests verifican el comportamiento a nivel de item (render, precio,
// controles de cantidad, eliminar) usando CartPage como contenedor.

let cart: ReturnType<typeof useCart>;
function CaptureCart() {
  cart = useCart();
  return null;
}

describe("CartItem (a través de CartPage)", () => {
  it("muestra el nombre, categoría y precio unitario del producto", () => {
    renderWithProviders(
      <>
        <CaptureCart />
        <CartPage />
      </>,
    );
    act(() => cart.addItem(mockProduct));

    expect(screen.getByText("Mate Imperial")).toBeInTheDocument();
    expect(screen.getByText("mates")).toBeInTheDocument();
    expect(screen.getByText(/15\.000.*c\/u/i)).toBeInTheDocument();
  });

  it("muestra la imagen del producto con alt correcto", () => {
    renderWithProviders(
      <>
        <CaptureCart />
        <CartPage />
      </>,
    );
    act(() => cart.addItem(mockProduct));

    const imgs = screen.getAllByAltText("Mate Imperial");
    expect(imgs.length).toBeGreaterThan(0);
  });

  it("muestra el botón de eliminar con aria-label descriptivo", () => {
    renderWithProviders(
      <>
        <CaptureCart />
        <CartPage />
      </>,
    );
    act(() => cart.addItem(mockProduct));

    expect(
      screen.getByRole("button", { name: /Quitar Mate Imperial del carrito/i }),
    ).toBeInTheDocument();
  });

  it("al quitar el item el carrito queda vacío", async () => {
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

  it("muestra el resumen correcto con múltiples items y cantidades", () => {
    const p2 = makeProduct({ id: "p2", name: "Bombilla Alpaca", price: 8000 });
    renderWithProviders(
      <>
        <CaptureCart />
        <CartPage />
      </>,
    );
    act(() => {
      cart.addItem(mockProduct, 2);
      cart.addItem(p2, 1);
    });

    // 3 unidades en total (2 + 1)
    expect(screen.getByText(/3 productos en total/i)).toBeInTheDocument();
    expect(screen.getByText("Bombilla Alpaca")).toBeInTheDocument();
  });

  it("al vaciar el carrito muestra el estado vacío", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <CaptureCart />
        <CartPage />
      </>,
    );
    act(() => cart.addItem(mockProduct));

    await user.click(
      screen.getByRole("button", { name: /Vaciar carrito/i }),
    );

    expect(screen.getByText(/Tu carrito está vacío/i)).toBeInTheDocument();
  });
});
