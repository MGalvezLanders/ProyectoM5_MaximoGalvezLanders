import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("<Button />", () => {
  it("renderiza el texto del children", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("se deshabilita con la prop disabled", () => {
    render(<Button disabled>Enviar</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("llama onClick al hacer click cuando está habilitado", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Clic</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("no dispara onClick cuando está deshabilitado", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={handleClick} disabled>
        Bloqueado
      </Button>,
    );
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("type='submit' envía el formulario", async () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <form onSubmit={handleSubmit}>
        <Button type="submit">Enviar</Button>
      </form>,
    );
    await user.click(screen.getByRole("button"));
    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it("fullWidth aplica la clase de ancho completo", () => {
    render(<Button fullWidth>Full</Button>);
    expect(screen.getByRole("button")).toHaveClass("w-full");
  });

  it("acepta className adicional", () => {
    render(<Button className="extra-class">Tag</Button>);
    expect(screen.getByRole("button")).toHaveClass("extra-class");
  });
});
