import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/utils";
import LoginPage from "../../pages/forms/LoginPage";
import * as authService from "@/services/auth.service";

describe("<LoginPage /> (formulario de login)", () => {
  it("renderiza el formulario", () => {
    renderWithProviders(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /Bienvenido de vuelta/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  it("muestra error de validación con un email inválido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "no-es-un-email");

    expect(await screen.findByText("Email inválido")).toBeInTheDocument();
  });

  it("con credenciales válidas llama al servicio de login", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.click(screen.getByRole("button", { name: /Iniciar sesión/i }));

    await waitFor(() => {
      expect(vi.mocked(authService.login)).toHaveBeenCalledWith(
        "test@example.com",
        "secret123",
      );
    });
  });
});
