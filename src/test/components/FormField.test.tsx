import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField } from "@/components/forms/FormField";

describe("<FormField />", () => {
  it("renderiza el label y el input asociados por id", () => {
    render(<FormField id="email" label="Email" name="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("muestra el error como role='alert'", () => {
    render(
      <FormField
        id="email"
        label="Email"
        name="email"
        error="Campo requerido"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Campo requerido");
  });

  it("no muestra la alerta cuando no hay error", () => {
    render(<FormField id="email" label="Email" name="email" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("aplica type='password' al input", () => {
    render(
      <FormField
        id="pass"
        label="Contraseña"
        name="password"
        type="password"
      />,
    );
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute(
      "type",
      "password",
    );
  });

  it("llama onChange con el evento al escribir", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FormField id="name" label="Nombre" name="name" onChange={onChange} />,
    );
    await user.type(screen.getByLabelText("Nombre"), "Maxi");
    expect(onChange).toHaveBeenCalled();
  });

  it("acepta y muestra el placeholder", () => {
    render(
      <FormField
        id="email"
        label="Email"
        name="email"
        placeholder="tu@email.com"
      />,
    );
    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
  });
});
