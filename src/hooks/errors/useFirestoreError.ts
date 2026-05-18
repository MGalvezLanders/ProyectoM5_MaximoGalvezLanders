import { useCallback, useState } from "react";

const FIRESTORE_MESSAGES: Record<string, string> = {
    "permission-denied": "No tenés permisos para acceder a este recurso",
    "not-found": "El recurso solicitado no existe",
    "unavailable": "Servicio no disponible. Intentá más tarde",
    "already-exists": "El recurso ya existe",
    "cancelled": "La operación fue cancelada",
    "deadline-exceeded": "La operación tardó demasiado",
    "resource-exhausted": "Se superó la cuota disponible",
    "failed-precondition": "No se cumplen las condiciones para esta operación",
    "aborted": "La operación fue abortada",
    "out-of-range": "Valor fuera de rango",
    "unauthenticated": "Necesitás iniciar sesión",
    "internal": "Error interno del servidor",
    "data-loss": "Se perdieron datos durante la operación",
};

function parseFirestoreError(err: unknown): string {
    if (err && typeof err === "object" && "code" in err) {
        const code = String((err as { code: unknown }).code);
        if (code in FIRESTORE_MESSAGES) return FIRESTORE_MESSAGES[code];
    }
    if (err instanceof Error && err.message) return err.message;
    return "Error al acceder a la base de datos";
}

export function useFirestoreError() {
    const [error, setError] = useState<string | null>(null);

    const captureError = useCallback((err: unknown) => {
        setError(parseFirestoreError(err));
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { error, captureError, clearError };
}
