import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuantityInput } from "@/components/ui/QuantityInput";

describe("<QuantityInput />", () => {
  it("muestra el valor actual en el input", () => {
    render(<QuantityInput value={3} onChange={vi.fn()} />);
    expect(screen.getByRole("spinbutton", { name: "Cantidad" })).toHaveValue(3);
  });

  it("llama onChange con value+1 al hacer click en el botón de incremento", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityInput value={2} onChange={onChange} min={1} max={99} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("llama onChange con value-1 al hacer click en el botón de decremento", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityInput value={5} onChange={onChange} min={1} max={99} />);
    await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("el botón de decremento se deshabilita cuando value === min", () => {
    render(<QuantityInput value={1} onChange={vi.fn()} min={1} />);
    expect(screen.getByRole("button", { name: "Disminuir cantidad" })).toBeDisabled();
  });

  it("el botón de incremento se deshabilita cuando value === max", () => {
    render(<QuantityInput value={10} onChange={vi.fn()} max={10} />);
    expect(screen.getByRole("button", { name: "Aumentar cantidad" })).toBeDisabled();
  });

  it("no invoca onChange al hacer click en decremento deshabilitado", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<QuantityInput value={1} onChange={onChange} min={1} />);
    await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("llama onChange con el valor parseado al cambiar el input", () => {
    // Usamos fireEvent.change para setear el valor directamente: con un input
    // controlado, user.type appendea carácter a carácter en lugar de reemplazar.
    const onChange = vi.fn();
    render(<QuantityInput value={1} onChange={onChange} min={1} max={20} />);
    const input = screen.getByRole("spinbutton", { name: "Cantidad" });
    fireEvent.change(input, { target: { value: "8" } });
    expect(onChange).toHaveBeenLastCalledWith(8);
  });

  it("clampea al mínimo cuando se ingresa un valor menor que min", () => {
    const onChange = vi.fn();
    render(<QuantityInput value={5} onChange={onChange} min={3} max={20} />);
    const input = screen.getByRole("spinbutton", { name: "Cantidad" });
    fireEvent.change(input, { target: { value: "1" } });
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it("clampea al máximo cuando se ingresa un valor mayor que max", () => {
    const onChange = vi.fn();
    render(<QuantityInput value={5} onChange={onChange} min={1} max={10} />);
    const input = screen.getByRole("spinbutton", { name: "Cantidad" });
    fireEvent.change(input, { target: { value: "99" } });
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it("ignora entradas que no parsean como número", () => {
    const onChange = vi.fn();
    render(<QuantityInput value={5} onChange={onChange} min={1} max={10} />);
    const input = screen.getByRole("spinbutton", { name: "Cantidad" });
    fireEvent.change(input, { target: { value: "" } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
