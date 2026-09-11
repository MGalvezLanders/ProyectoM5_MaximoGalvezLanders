import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatOrderDate,
  formatOrderDateShort,
} from "@/utils/formatting";

// Helper que simula un Timestamp de Firestore
function makeTimestamp(date: Date) {
  return {
    toDate: () => date,
  };
}

describe("formatPrice", () => {
  it("formatea un precio entero como moneda ARS sin decimales", () => {
    const result = formatPrice(15000);
    expect(result).toContain("15.000");
  });

  it("formatea cero correctamente", () => {
    const result = formatPrice(0);
    expect(result).toContain("0");
  });

  it("formatea números grandes con separadores de miles", () => {
    const result = formatPrice(1000000);
    expect(result).toContain("1.000.000");
  });

  it("redondea decimales (maximumFractionDigits = 0)", () => {
    const result = formatPrice(9999.99);
    expect(result).not.toContain(",");
    expect(result).toContain("10.000");
  });
});

describe("formatOrderDate", () => {
  it("formatea un objeto con toDate() como fecha y hora en es-AR", () => {
    const ts = makeTimestamp(new Date("2024-06-15T14:30:00"));
    const result = formatOrderDate(ts);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/6|jun/i);
    expect(result).toMatch(/2024/);
  });

  it("devuelve '—' para null", () => {
    expect(formatOrderDate(null)).toBe("—");
  });

  it("devuelve '—' para undefined", () => {
    expect(formatOrderDate(undefined)).toBe("—");
  });

  it("devuelve '—' para un string ISO", () => {
    expect(formatOrderDate("2024-06-15")).toBe("—");
  });

  it("devuelve '—' para un objeto sin toDate", () => {
    expect(formatOrderDate({ seconds: 0 })).toBe("—");
  });

  it("devuelve '—' si toDate no es función", () => {
    expect(formatOrderDate({ toDate: "no-es-funcion" })).toBe("—");
  });
});

describe("formatOrderDateShort", () => {
  it("formatea un Timestamp en formato corto (día mes año)", () => {
    const ts = makeTimestamp(new Date("2024-03-05T00:00:00"));
    const result = formatOrderDateShort(ts);
    expect(result).toMatch(/05|5/);
    expect(result).toMatch(/mar|3/i);
    expect(result).toMatch(/2024/);
  });

  it("devuelve '—' para null", () => {
    expect(formatOrderDateShort(null)).toBe("—");
  });

  it("devuelve '—' para undefined", () => {
    expect(formatOrderDateShort(undefined)).toBe("—");
  });

  it("devuelve '—' para un número simple", () => {
    expect(formatOrderDateShort(1234567890)).toBe("—");
  });

  it("devuelve '—' si toDate no es función", () => {
    expect(formatOrderDateShort({ toDate: 42 })).toBe("—");
  });
});
