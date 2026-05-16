export type AppErrorType =
    | "auth"
    | "db"
    | "storage"
    | "network"
    | "http"
    | "unknown";

export type AppError = {
    code: string;
    message: string;
    type: AppErrorType;
};

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

const FIRESTORE_MESSAGES: Record<string, string> = {
    "permission-denied": "No tenés permisos para acceder a este recurso",
    "not-found": "El recurso solicitado no existe",
    "unavailable": "Servicio no disponible. Intentá más tarde",
    "already-exists": "El recurso ya existe",
};

const STORAGE_MESSAGES: Record<string, string> = {
    "NoSuchKey": "El archivo no fue encontrado",
    "storage/object-not-found": "El archivo no fue encontrado",
    "AccessDenied": "No tenés permisos para acceder al archivo",
    "storage/unauthorized": "No tenés permisos para acceder al archivo",
};

function getStatusFromError(err: object): number | null {
    if ("status" in err && typeof (err as { status: unknown }).status === "number") {
        return (err as { status: number }).status;
    }
    return null;
}

export function handleError(err: unknown): AppError {
    if (err instanceof Response) {
        const message = HTTP_MESSAGES[err.status] ?? `Error HTTP ${err.status}`;
        return { code: `http/${err.status}`, message, type: "http" };
    }

    if (err && typeof err === "object") {
        const status = getStatusFromError(err);
        if (status !== null) {
            const message = HTTP_MESSAGES[status] ?? `Error HTTP ${status}`;
            return { code: `http/${status}`, message, type: "http" };
        }
    }

    if (err && typeof err === "object" && "code" in err) {
        const code = String((err as { code: unknown }).code);

        if (code.startsWith("auth/")) {
            return {
                code,
                message: FIREBASE_AUTH_MESSAGES[code] ?? "Error de autenticación",
                type: "auth",
            };
        }

        if (code in FIRESTORE_MESSAGES) {
            return { code, message: FIRESTORE_MESSAGES[code], type: "db" };
        }

        if (code in STORAGE_MESSAGES) {
            return { code, message: STORAGE_MESSAGES[code], type: "storage" };
        }

        const message =
            "message" in err && typeof (err as { message: unknown }).message === "string"
                ? (err as { message: string }).message
                : "Ocurrió un error inesperado";
        return { code, message, type: "unknown" };
    }

    if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        return {
            code: "network/fetch-failed",
            message: "No se pudo conectar con el servidor. Revisá tu conexión",
            type: "network",
        };
    }

    if (err instanceof DOMException && err.name === "AbortError") {
        return {
            code: "network/aborted",
            message: "La operación fue cancelada",
            type: "network",
        };
    }

    if (err instanceof Error) {
        return {
            code: "unknown/error",
            message: err.message || "Ocurrió un error inesperado",
            type: "unknown",
        };
    }

    return {
        code: "unknown/unrecognized",
        message: "Ocurrió un error. Intentá de nuevo",
        type: "unknown",
    };
}
