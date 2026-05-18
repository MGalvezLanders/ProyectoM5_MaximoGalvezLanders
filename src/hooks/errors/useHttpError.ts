import { useCallback, useState } from "react";

const HTTP_MESSAGES: Record<number, string> = {
    400: "Solicitud inválida. Revisá los datos enviados",
    401: "No estás autenticado. Iniciá sesión nuevamente",
    403: "No tenés permisos para realizar esta acción",
    404: "El recurso solicitado no existe",
    408: "La solicitud tardó demasiado. Intentá de nuevo",
    409: "Conflicto con el estado actual del recurso",
    422: "Datos inválidos",
    429: "Demasiadas solicitudes. Esperá un momento",
    500: "Error en el servidor. Intentá más tarde",
    502: "El servidor no responde correctamente",
    503: "Servicio no disponible. Intentá más tarde",
    504: "Tiempo de espera agotado",
};

function getStatusFromError(err: object): number | null {
    if ("status" in err && typeof (err as { status: unknown }).status === "number") {
        return (err as { status: number }).status;
    }
    return null;
}

function parseHttpError(err: unknown): string {
    if (err instanceof Response) {
        return HTTP_MESSAGES[err.status] ?? `Error HTTP ${err.status}`;
    }
    if (err && typeof err === "object") {
        const status = getStatusFromError(err);
        if (status !== null) {
            return HTTP_MESSAGES[status] ?? `Error HTTP ${status}`;
        }
    }
    if (err instanceof Error && err.message) return err.message;
    return "Error en la solicitud";
}

export function useHttpError() {
    const [error, setError] = useState<string | null>(null);

    const captureError = useCallback((err: unknown) => {
        setError(parseHttpError(err));
    }, []);

    const clearError = useCallback(() => setError(null), []);

    return { error, captureError, clearError };
}
