import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/utils";
import { ProductCard } from "../../components/product/ProductCard";
import {
  mockProduct,
  mockProductOutOfStock,
  mockFirebaseUser,
} from "@/test/fixtures";

describe("<ProductCard />", () => {
  it("muestra nombre, categoría y precio formateado", () => {
    renderWithProviders(<ProductCard product={mockProduct} />);

    expect(screen.getByText("Mate Imperial")).toBeInTheDocument();
    expect(screen.getByText("mates")).toBeInTheDocument();
    // Precio en es-AR: símbolo $ + separador de miles.
    expect(screen.getByText(/15\.000/)).toBeInTheDocument();
  });

  it("al hacer click en Agregar pasa a estado 'Agregado'", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProductCard product={mockProduct} />, {
      mockUser: mockFirebaseUser,
    });

    const button = screen.getByRole("button", { name: "Agregar" });
    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Agregado" }),
    ).toBeInTheDocument();
  });

  it("deshabilita la compra y muestra 'Sin stock' cuando stock es 0", () => {
    renderWithProviders(<ProductCard product={mockProductOutOfStock} />);

    expect(screen.getByText("Sin stock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar" })).toBeDisabled();
  });
});
