import { useCallback, useState } from "react";

const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
    "auth/invalid-credential": "Email o contraseña incorrectos",
    "auth/email-already-in-use": "Ya existe una cuenta con ese email",
    "auth/too-many-requests": "Demasiados intentos. Intentá más tarde",
    "auth/user-disabled": "Esta cuenta fue deshabilitada",
    "auth/user-not-found": "Usuario no encontrado",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/weak-password": "La contraseña es muy débil",
    "auth/invalid-email": "Email inválido",
    "auth/network-request-failed": "Error de conexión. Revisá tu internet",
    "auth/popup-closed-by-user": "Se cerró la ventana de Google",
    "auth/cancelled-popup-request": "Operación cancelada",
};

function parseAuthError(err: unknown): string {
    if (err && typeof err === "object" && "code" in err) {
        const code = String((err as { code: unknown }).code);
        if (code.startsWith("auth/")) {
            return FIREBASE_AUTH_MESSAGES[code] ?? "Error de autenticación";
        }
    }
    if (err instanceof Error && err.message) return err.message;
    return "Error de autenticación";
}

export function useAuthError() {
    const [error, setError] = useState<string | null>(null);

    const captureError = useCallback((err: unknown) => {
        setError(parseAuthError(err));
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { error, captureError, clearError };
}
