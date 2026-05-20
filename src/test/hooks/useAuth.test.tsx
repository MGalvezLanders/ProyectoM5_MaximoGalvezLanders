import { describe, it, expect, vi } from "vitest";
import { type ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "../../hooks/useAuth";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAuth", () => {
  it("lanza error si se usa fuera de <AuthProvider>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      /dentro de <AuthProvider>/,
    );
    spy.mockRestore();
  });

  it("expone la API de auth y, deslogueado, deja user/profile en null", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // onAuthChange (mock global en setup.ts) responde con null → loading pasa a false.
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(typeof result.current.login).toBe("function");
    expect(typeof result.current.register).toBe("function");
    expect(typeof result.current.loginWithGoogle).toBe("function");
    expect(typeof result.current.logout).toBe("function");
  });
});
