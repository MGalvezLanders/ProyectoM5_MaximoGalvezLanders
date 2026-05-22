import { describe, it, expect, beforeEach, vi } from "vitest";
import { type ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import type { User as FirebaseUser } from "firebase/auth";
import { AuthContext } from "@/context/AuthContext";
import { CartContext } from "@/context/cart/CartContext";
import { ProductsActionsContext } from "@/context/ProductsContext";
import CheckoutPage from "@/pages/cart/CheckoutPage";
import { createOrder } from "@/services/orders.service";
import type { CartItem } from "@/types/cart";
import { mockProduct, mockFirebaseUser } from "@/test/fixtures";

// Spies que se inicializan en cada test (beforeEach los limpia).
const syncStockSpy = vi.fn();
const clearCartSpy = vi.fn();

/**
 * Wrapper inline que arma el árbol que <CheckoutPage /> necesita:
 *   MemoryRouter > AuthContext > ProductsActionsContext > CartContext
 *
 * Inyectamos `CartContext` directamente con items pre-cargados (en vez de
 * montar `CartProvider` real) para evitar la race condition entre el
 * <Navigate to="/cart" /> del primer render y la hidratación async del
 * carrito vía getCart(). Lo que estamos testeando es el flujo de checkout,
 * no la hidratación del carrito (eso vive en sus propios tests).
 */
function renderCheckout({
  user = mockFirebaseUser,
  cartItems = [{ ...mockProduct, quantity: 1 }] as CartItem[],
}: {
  user?: Partial<FirebaseUser> | null;
  cartItems?: CartItem[];
} = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={["/checkout"]}>
        <AuthContext.Provider
          value={{
            user: user as FirebaseUser | null,
            profile: null,
            loading: false,
            login: async () => {},
            register: async () => {},
            loginWithGoogle: async () => {},
            logout: async () => {},
          }}
        >
          <ProductsActionsContext.Provider
            value={{
              createOne: vi.fn(),
              updateOne: vi.fn(),
              removeOne: vi.fn(),
              bulkCreate: vi.fn(),
              syncStockAfterPurchase: syncStockSpy,
            }}
          >
            <CartContext.Provider
              value={{
                state: { items: cartItems },
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
                clear: clearCartSpy,
                error: null,
              }}
            >
              {children}
            </CartContext.Provider>
          </ProductsActionsContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  }

  return render(
    <Routes>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/cart" element={<h1>Página del carrito</h1>} />
      <Route path="/orders/:id" element={<h1>Detalle de orden</h1>} />
    </Routes>,
    { wrapper: Wrapper },
  );
}

describe("<CheckoutPage />", () => {
  beforeEach(() => {
    syncStockSpy.mockClear();
    clearCartSpy.mockClear();
    vi.mocked(createOrder).mockClear();
    vi.mocked(createOrder).mockResolvedValue("mock-order-id");
  });

  it("redirige al carrito si está vacío", async () => {
    renderCheckout({ cartItems: [] });

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Página del carrito/i }),
      ).toBeInTheDocument();
    });
  });

  it("renderiza el formulario y el resumen con el item del carrito", () => {
    renderCheckout();

    expect(
      screen.getByRole("heading", { name: /^Finalizar compra$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Datos de envío/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Resumen del pedido/i }),
    ).toBeInTheDocument();

    // Inputs del formulario
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ciudad/i)).toBeInTheDocument();

    // El producto sembrado aparece en el resumen lateral.
    expect(screen.getByText("Mate Imperial")).toBeInTheDocument();
  });

  it("muestra errores de validación cuando el formulario está incompleto", async () => {
    const user = userEvent.setup();
    renderCheckout();

    const nameInput = screen.getByLabelText(/Nombre completo/i);
    // Tipeamos 1 char → dispara la regla "Mínimo 2 caracteres".
    await user.type(nameInput, "A");

    expect(
      await screen.findByText(/Mínimo 2 caracteres/i),
    ).toBeInTheDocument();

    // El botón se deshabilita mientras haya errores.
    expect(
      screen.getByRole("button", { name: /Confirmar compra/i }),
    ).toBeDisabled();

    // Y `createOrder` nunca se invoca.
    expect(vi.mocked(createOrder)).not.toHaveBeenCalled();
  });

  it("crea la orden con los datos del formulario y redirige a /orders/:id", async () => {
    const user = userEvent.setup();
    renderCheckout({ cartItems: [{ ...mockProduct, quantity: 2 }] });

    await user.type(screen.getByLabelText(/Nombre completo/i), "Juan Pérez");
    await user.type(
      screen.getByLabelText(/Dirección/i),
      "Av. Siempre Viva 742",
    );
    await user.type(screen.getByLabelText(/Ciudad/i), "Rosario");

    await user.click(
      screen.getByRole("button", { name: /Confirmar compra/i }),
    );

    await waitFor(() => {
      expect(vi.mocked(createOrder)).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(createOrder)).toHaveBeenCalledWith({
      userId: mockFirebaseUser.uid,
      items: [
        {
          id: mockProduct.id,
          name: mockProduct.name,
          price: mockProduct.price,
          quantity: 2,
          imageUrl: mockProduct.imageUrl,
        },
      ],
      totalPrice: mockProduct.price * 2,
      shippingInfo: {
        name: "Juan Pérez",
        address: "Av. Siempre Viva 742",
        city: "Rosario",
      },
    });

    // syncStockAfterPurchase se invoca con los ids/cantidades vendidas para
    // que el state local de productos refleje el stock decrementado sin
    // tener que volver a pedirlo a Firestore.
    expect(syncStockSpy).toHaveBeenCalledWith([
      { id: mockProduct.id, quantity: 2 },
    ]);

    // Se vacía el carrito tras la orden exitosa.
    expect(clearCartSpy).toHaveBeenCalledTimes(1);

    // Redirige a la página de la orden creada.
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Detalle de orden/i }),
      ).toBeInTheDocument();
    });
  });

  it("muestra un mensaje de error si createOrder falla", async () => {
    vi.mocked(createOrder).mockRejectedValueOnce(
      new Error("Stock insuficiente"),
    );

    const user = userEvent.setup();
    renderCheckout();

    await user.type(screen.getByLabelText(/Nombre completo/i), "Juan Pérez");
    await user.type(screen.getByLabelText(/Dirección/i), "Calle Falsa 123");
    await user.type(screen.getByLabelText(/Ciudad/i), "Córdoba");

    await user.click(
      screen.getByRole("button", { name: /Confirmar compra/i }),
    );

    expect(
      await screen.findByText(/No pudimos crear la orden/i),
    ).toBeInTheDocument();

    // Como la transacción falló, NO se limpia el carrito y seguimos en /checkout.
    expect(clearCartSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: /^Finalizar compra$/i }),
    ).toBeInTheDocument();
  });
});
