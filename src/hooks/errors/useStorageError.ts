import { useCallback, useState } from "react";

const STORAGE_MESSAGES: Record<string, string> = {
    "NoSuchKey": "El archivo no fue encontrado",
    "storage/object-not-found": "El archivo no fue encontrado",
    "AccessDenied": "No tenés permisos para acceder al archivo",
    "storage/unauthorized": "No tenés permisos para acceder al archivo",
    "storage/canceled": "La subida fue cancelada",
    "storage/quota-exceeded": "Se superó la cuota de almacenamiento",
    "storage/unauthenticated": "Necesitás iniciar sesión",
    "storage/retry-limit-exceeded": "Se superó el límite de reintentos",
    "storage/invalid-checksum": "El archivo está corrupto",
    "storage/server-file-wrong-size": "Tamaño de archivo inválido",
};

function parseStorageError(err: unknown): string {
    if (err && typeof err === "object" && "code" in err) {
        const code = String((err as { code: unknown }).code);
        if (code in STORAGE_MESSAGES) return STORAGE_MESSAGES[code];
    }
    if (err instanceof Error && err.message) return err.message;
    return "Error al acceder al archivo";
}

export function useStorageError() {
    const [error, setError] = useState<string | null>(null);

    const captureError = useCallback((err: unknown) => {
        setError(parseStorageError(err));
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { error, captureError, clearError };
}
