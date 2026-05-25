import { describe, it, expect, vi, afterEach } from "vitest";
import { type ReactNode } from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/auth.service";
import * as usersService from "@/services/users.service";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

// Restaura onAuthChange a su comportamiento por defecto (usuario null)
// después de cada test para no contaminar los siguientes.
afterEach(() => {
  vi.mocked(authService.onAuthChange).mockImplementation((cb) => {
    (cb as (u: unknown) => void)(null);
    return () => {};
  });
});

function mockLoggedIn(uid = "test-uid", email = "a@b.com") {
  vi.mocked(authService.onAuthChange).mockImplementationOnce((cb) => {
    (cb as (u: unknown) => void)({ uid, email });
    return () => {};
  });
  vi.mocked(usersService.resolveOrCreateProfile).mockResolvedValue({
    name: "Usuario Test",
    email,
    role: "customer",
  });
}

describe("AuthContext", () => {
  it("expone updateName y changePassword como funciones", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.updateName).toBe("function");
    expect(typeof result.current.changePassword).toBe("function");
  });

  it("updateName llama a updateUserDisplayName y updateUserName", async () => {
    const displayNameSpy = vi
      .mocked(authService.updateUserDisplayName)
      .mockResolvedValue(undefined);
    const userNameSpy = vi
      .mocked(usersService.updateUserName)
      .mockResolvedValue(undefined);

    mockLoggedIn("test-uid", "a@b.com");

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateName("Nuevo Nombre");
    });

    expect(displayNameSpy).toHaveBeenCalledWith("Nuevo Nombre");
    expect(userNameSpy).toHaveBeenCalledWith("test-uid", "Nuevo Nombre");
  });

  it("updateName actualiza el profile en el estado", async () => {
    vi.mocked(authService.updateUserDisplayName).mockResolvedValue(undefined);
    vi.mocked(usersService.updateUserName).mockResolvedValue(undefined);

    vi.mocked(authService.onAuthChange).mockImplementationOnce((cb) => {
      (cb as (u: unknown) => void)({ uid: "u1", email: "x@y.com" });
      return () => {};
    });
    vi.mocked(usersService.resolveOrCreateProfile).mockResolvedValue({
      name: "Original",
      email: "x@y.com",
      role: "customer",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.profile?.name).toBe("Original"));

    await act(async () => {
      await result.current.updateName("  Actualizado  ");
    });

    expect(result.current.profile?.name).toBe("Actualizado");
  });

  it("updateName lanza error si no hay usuario logueado", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();

    await expect(
      act(async () => {
        await result.current.updateName("Nombre");
      }),
    ).rejects.toThrow();
  });

  it("changePassword delega en changeUserPassword", async () => {
    const changeSpy = vi
      .mocked(authService.changeUserPassword)
      .mockResolvedValue(undefined);

    mockLoggedIn("u2", "c@d.com");

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.changePassword("vieja123", "nueva456");
    });

    expect(changeSpy).toHaveBeenCalledWith("vieja123", "nueva456");
  });

  it("logout limpia el profile del estado", async () => {
    mockLoggedIn("u3", "e@f.com");
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.profile).not.toBeNull());

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.profile).toBeNull();
  });
});
