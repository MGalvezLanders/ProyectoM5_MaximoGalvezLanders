import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("<Badge />", () => {
  it("muestra el texto del children", () => {
    render(<Badge>Nuevo</Badge>);
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
  });

  it("acepta className adicional sin perder las clases base", () => {
    render(<Badge className="extra-class">Tag</Badge>);
    const el = screen.getByText("Tag");
    expect(el).toHaveClass("extra-class");
    expect(el).toHaveClass("rounded-full");
  });

  it.each(["neutral", "sky", "sun", "field", "danger"] as const)(
    "renderiza con tone '%s' sin errores",
    (tone) => {
      render(<Badge tone={tone}>{tone}</Badge>);
      expect(screen.getByText(tone)).toBeInTheDocument();
    },
  );

  it("usa tone 'neutral' por defecto", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });
});
