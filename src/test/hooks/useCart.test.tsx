import { describe, it, expect, vi } from "vitest";
import { type ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/cart/CartContext";
import { useCart } from "../../hooks/cart/useCart";
import { mockProduct } from "@/test/fixtures";

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  </MemoryRouter>
);

describe("useCart", () => {
  it("lanza error si se usa fuera de <CartProvider>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow(
      /dentro de <CartProvider>/,
    );
    spy.mockRestore();
  });

  it("expone la API del carrito y arranca vacío", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.state.items).toHaveLength(0);
    expect(typeof result.current.addItem).toBe("function");
    expect(typeof result.current.removeItem).toBe("function");
    expect(typeof result.current.updateQuantity).toBe("function");
    expect(typeof result.current.clear).toBe("function");
  });

  it("addItem agrega un producto al estado", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(mockProduct, 2);
    });

    expect(result.current.state.items).toHaveLength(1);
    expect(result.current.state.items[0]).toMatchObject({
      id: "p1",
      quantity: 2,
    });
  });

  it("removeItem y clear vacían el carrito", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addItem(mockProduct));
    expect(result.current.state.items).toHaveLength(1);

    act(() => result.current.clear());
    expect(result.current.state.items).toHaveLength(0);
  });
});
