import { describe, it, expect } from "vitest";
import { isAdminEmail } from "@/utils/admin";

// En el entorno de tests VITE_ADMIN_EMAILS no está definido (import.meta.env lo
// resuelve a undefined → ""). La lista de admins queda vacía, por lo que la
// función siempre devuelve false para cualquier email.
// Para testear el comportamiento con admins reales habría que recargar el módulo
// con vi.resetModules() + vi.stubEnv(), que está fuera del scope de este test.
describe("isAdminEmail", () => {
  it("devuelve false para cualquier email cuando no hay admins configurados", () => {
    expect(isAdminEmail("admin@example.com")).toBe(false);
    expect(isAdminEmail("superuser@test.com")).toBe(false);
  });

  it("devuelve false cuando el email es null", () => {
    expect(isAdminEmail(null)).toBe(false);
  });

  it("devuelve false cuando el email es undefined", () => {
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it("devuelve false con string vacío", () => {
    expect(isAdminEmail("")).toBe(false);
  });
});
