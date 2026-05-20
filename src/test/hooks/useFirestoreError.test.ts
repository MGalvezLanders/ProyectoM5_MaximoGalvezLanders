import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFirestoreError } from "@/hooks/errors/useFirestoreError";

describe("useFirestoreError", () => {
  it("empieza con error null", () => {
    const { result } = renderHook(() => useFirestoreError());
    expect(result.current.error).toBeNull();
  });

  it.each([
    ["permission-denied", "No tenés permisos para acceder a este recurso"],
    ["not-found", "El recurso solicitado no existe"],
    ["unavailable", "Servicio no disponible. Intentá más tarde"],
    ["already-exists", "El recurso ya existe"],
    ["unauthenticated", "Necesitás iniciar sesión"],
    ["internal", "Error interno del servidor"],
    ["resource-exhausted", "Se superó la cuota disponible"],
  ])("mapea código '%s' al mensaje correcto", (code, expectedMsg) => {
    const { result } = renderHook(() => useFirestoreError());
    act(() => {
      result.current.captureError({ code });
    });
    expect(result.current.error).toBe(expectedMsg);
  });

  it("usa el message del Error para códigos no mapeados", () => {
    const { result } = renderHook(() => useFirestoreError());
    act(() => {
      result.current.captureError(new Error("Mensaje personalizado"));
    });
    expect(result.current.error).toBe("Mensaje personalizado");
  });

  it("devuelve mensaje genérico cuando no hay código ni message", () => {
    const { result } = renderHook(() => useFirestoreError());
    act(() => {
      result.current.captureError({});
    });
    expect(result.current.error).toBe("Error al acceder a la base de datos");
  });

  it("clearError restablece el error a null", () => {
    const { result } = renderHook(() => useFirestoreError());
    act(() => {
      result.current.captureError({ code: "unavailable" });
    });
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("errores null/undefined devuelven el mensaje genérico", () => {
    const { result } = renderHook(() => useFirestoreError());
    act(() => {
      result.current.captureError(null);
    });
    expect(result.current.error).toBe("Error al acceder a la base de datos");
  });
});
