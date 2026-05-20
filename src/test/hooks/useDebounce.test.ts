import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "../../hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("devuelve el valor inicial de inmediato", () => {
    const { result } = renderHook(() => useDebounce("hola", 400));
    expect(result.current).toBe("hola");
  });

  it("no actualiza el valor antes de que pase el delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: "a" },
    });

    rerender({ v: "ab" });
    act(() => vi.advanceTimersByTime(399));
    expect(result.current).toBe("a");
  });

  it("actualiza el valor una vez transcurrido el delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: "a" },
    });

    rerender({ v: "ab" });
    act(() => vi.advanceTimersByTime(400));
    expect(result.current).toBe("ab");
  });

  it("reinicia el timer si el valor cambia antes de cumplirse el delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: "a" },
    });

    rerender({ v: "ab" });
    act(() => vi.advanceTimersByTime(300));
    rerender({ v: "abc" });
    act(() => vi.advanceTimersByTime(300)); // total 600, pero solo 300 desde el último cambio
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(100)); // ahora sí 400 desde "abc"
    expect(result.current).toBe("abc");
  });
});
