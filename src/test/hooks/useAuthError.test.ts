import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuthError } from "@/hooks/errors/useAuthError";

describe("useAuthError", () => {
  it("empieza con error null", () => {
    const { result } = renderHook(() => useAuthError());
    expect(result.current.error).toBeNull();
  });

  it.each([
    ["auth/invalid-credential", "Email o contraseña incorrectos"],
    ["auth/email-already-in-use", "Ya existe una cuenta con ese email"],
    ["auth/too-many-requests", "Demasiados intentos. Intentá más tarde"],
    ["auth/user-disabled", "Esta cuenta fue deshabilitada"],
    ["auth/weak-password", "La contraseña es muy débil"],
    ["auth/invalid-email", "Email inválido"],
    ["auth/network-request-failed", "Error de conexión. Revisá tu internet"],
    ["auth/popup-closed-by-user", "Se cerró la ventana de Google"],
  ])("mapea código '%s' al mensaje correcto", (code, expectedMsg) => {
    const { result } = renderHook(() => useAuthError());
    act(() => {
      result.current.captureError({ code });
    });
    expect(result.current.error).toBe(expectedMsg);
  });

  it("usa el mensaje del Error para códigos no mapeados", () => {
    const { result } = renderHook(() => useAuthError());
    act(() => {
      result.current.captureError(new Error("Fallo inesperado"));
    });
    expect(result.current.error).toBe("Fallo inesperado");
  });

  it("devuelve mensaje genérico para códigos auth/ desconocidos", () => {
    const { result } = renderHook(() => useAuthError());
    act(() => {
      result.current.captureError({ code: "auth/codigo-inexistente" });
    });
    expect(result.current.error).toBe("Error de autenticación");
  });

  it("devuelve mensaje genérico para errores sin código ni mensaje", () => {
    const { result } = renderHook(() => useAuthError());
    act(() => {
      result.current.captureError({});
    });
    expect(result.current.error).toBe("Error de autenticación");
  });

  it("clearError restablece el error a null", () => {
    const { result } = renderHook(() => useAuthError());
    act(() => {
      result.current.captureError({ code: "auth/invalid-credential" });
    });
    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("llamadas sucesivas a captureError reemplazan el error anterior", () => {
    const { result } = renderHook(() => useAuthError());
    act(() => {
      result.current.captureError({ code: "auth/user-disabled" });
    });
    act(() => {
      result.current.captureError({ code: "auth/invalid-credential" });
    });
    expect(result.current.error).toBe("Email o contraseña incorrectos");
  });
});
