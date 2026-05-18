import { useCallback, useState } from "react";

function parseNetworkError(err: unknown): string {
    if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        return "No se pudo conectar con el servidor. Revisá tu conexión";
    }
    if (err instanceof DOMException && err.name === "AbortError") {
        return "La operación fue cancelada";
    }
    if (err instanceof Error && err.message) return err.message;
    return "Error de conexión. Revisá tu internet";
}

export function useNetworkError() {
    const [error, setError] = useState<string | null>(null);

    const captureError = useCallback((err: unknown) => {
        setError(parseNetworkError(err));
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { error, captureError, clearError };
}
