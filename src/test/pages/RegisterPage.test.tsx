import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders, userEvent } from "@/test/utils";
import RegisterPage from "@/pages/forms/RegisterPage";
import * as authService from "@/services/auth.service";

describe("<RegisterPage /> (formulario de registro)", () => {
  it("renderiza el formulario con todos sus campos", () => {
    renderWithProviders(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: /Sumate al fogón/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
  });

  it("muestra error de validación si el email no es válido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText("Email"), "no-es-email");

    expect(await screen.findByText("Email inválido")).toBeInTheDocument();
  });

  it("muestra error si la contraseña es menor a 6 caracteres", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText("Contraseña"), "123");

    expect(await screen.findByText("Mínimo 6 caracteres")).toBeInTheDocument();
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText("Contraseña"), "secret123");
    await user.type(screen.getByLabelText("Confirmar contraseña"), "diferente");

    expect(
      await screen.findByText("Las contraseñas no coinciden"),
    ).toBeInTheDocument();
  });

  it("el botón de submit se deshabilita tras detectar un campo inválido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    // Inicialmente errors={} → el botón NO está deshabilitado (lazy validation).
    expect(
      screen.getByRole("button", { name: /Crear cuenta/i }),
    ).not.toBeDisabled();

    // Tras tipear algo inválido se ejecuta validate() y aparecen errores.
    await user.type(screen.getByLabelText("Email"), "no-es-email");
    expect(
      screen.getByRole("button", { name: /Crear cuenta/i }),
    ).toBeDisabled();
  });

  it("no llama register si se hace submit con el formulario vacío", async () => {
    const user = userEvent.setup();
    vi.mocked(authService.register).mockClear();

    renderWithProviders(<RegisterPage />);
    await user.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    expect(vi.mocked(authService.register)).not.toHaveBeenCalled();
    // Y se muestran los errores de validación.
    expect(
      await screen.findByText("El nombre es requerido"),
    ).toBeInTheDocument();
  });

  it("con datos válidos llama al servicio de register", async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await user.type(screen.getByLabelText("Nombre"), "Maximiliano");
    await user.type(screen.getByLabelText("Email"), "max@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password123");
    await user.type(
      screen.getByLabelText("Confirmar contraseña"),
      "password123",
    );
    await user.click(screen.getByRole("button", { name: /Crear cuenta/i }));

    await waitFor(() => {
      expect(vi.mocked(authService.register)).toHaveBeenCalledWith(
        "max@example.com",
        "password123",
        "Maximiliano",
      );
    });
  });

  it("tiene un link para ir a la página de login", () => {
    renderWithProviders(<RegisterPage />);
    expect(
      screen.getByRole("link", { name: /Iniciar sesión/i }),
    ).toBeInTheDocument();
  });
});
