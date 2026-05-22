import { getAuth } from "firebase/auth";

type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

const UPLOAD_TIMEOUT_MS = 60_000;

//* Extrae el ID token de Firebase del usuario actual.
//* El endpoint /api/s3-presign lo verifica server-side y exige admin.
const getAuthToken = async (): Promise<string> => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    throw new Error("Necesitás iniciar sesión para subir imágenes");
  }
  return currentUser.getIdToken();
};

const requestPresignedUrl = async (file: File): Promise<PresignResponse> => {
  const idToken = await getAuthToken();

  const response = await fetch("/api/s3-presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      size: file.size,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(
      data.error ?? `No se pudo obtener la URL de subida (${response.status})`,
    );
  }

  return response.json();
};

//* Parsea el body XML de error de S3 (formato estándar AWS) para extraer
//* <Code> y <Message>. Permite mostrar "AccessDenied: ..." en vez de "status 403".
const parseS3Error = (responseText: string, status: number): string => {
  if (!responseText) return `Upload S3 falló con status ${status}`;
  const code = /<Code>([^<]+)<\/Code>/.exec(responseText)?.[1];
  const message = /<Message>([^<]+)<\/Message>/.exec(responseText)?.[1];
  if (code || message) {
    return `S3 ${status} ${code ?? ""}${code && message ? ": " : ""}${message ?? ""}`.trim();
  }
  return `Upload S3 falló con status ${status}`;
};

const putToS3 = (
  url: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(parseS3Error(xhr.responseText, xhr.status)));
      }
    };

    xhr.onerror = () => reject(new Error("Error de red subiendo a S3"));
    xhr.ontimeout = () =>
      reject(
        new Error(
          `La subida tardó más de ${UPLOAD_TIMEOUT_MS / 1000}s — probá con una imagen más liviana o revisá tu conexión`,
        ),
      );

    xhr.send(file);
  });
};

/**
 * Sube un archivo a S3 usando una presigned URL generada por la Vercel Function.
 * Devuelve la URL pública del objeto + la key (necesaria para borrarlo después).
 */
export const uploadImage = async (
  file: File,
  onProgress?: (pct: number) => void,
): Promise<{ publicUrl: string; key: string }> => {
  const { uploadUrl, publicUrl, key } = await requestPresignedUrl(file);
  await putToS3(uploadUrl, file, onProgress);
  return { publicUrl, key };
};

/**
 * Extrae el S3 key de una publicUrl del bucket.
 * Ej: "https://bucket.s3.us-east-1.amazonaws.com/products/123-uuid.jpg" → "products/123-uuid.jpg"
 * Devuelve null si la URL no parece de nuestro bucket (img placeholder, externa, etc.)
 */
export const extractKeyFromUrl = (url: string): string | null => {
  const match = /\.amazonaws\.com\/(.+)$/.exec(url);
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Borra un objeto del bucket S3 vía /api/s3-delete.
 * Falla silenciosamente (solo loguea) — el cleanup de huérfanos no debe
 * romper la UX del admin si el delete falla.
 */
export const deleteImage = async (key: string): Promise<void> => {
  try {
    const idToken = await getAuthToken();
    const response = await fetch("/api/s3-delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ key }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.warn(`[deleteImage] falló (${response.status}):`, data.error);
    }
  } catch (err) {
    console.warn("[deleteImage] error inesperado:", err);
  }
};

/**
 * Helper: borra una imagen por su publicUrl. Útil cuando solo guardamos
 * la URL (Firestore), no la key. No-op si la URL no es de nuestro bucket.
 */
export const deleteImageByUrl = async (url: string): Promise<void> => {
  const key = extractKeyFromUrl(url);
  if (!key) return;
  await deleteImage(key);
};
