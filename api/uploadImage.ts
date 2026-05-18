type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  key: string;
};

const requestPresignedUrl = async (file: File): Promise<PresignResponse> => {
  const response = await fetch("/api/s3-presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

const putToS3 = (
  url: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload S3 falló con status ${xhr.status}`));
    };

    xhr.onerror = () => reject(new Error("Error de red subiendo a S3"));
    xhr.send(file);
  });
};

/**
 * Sube un archivo a S3 usando una presigned URL generada por la Vercel Function.
 * Devuelve la URL pública del objeto.
 */
export const uploadImage = async (
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> => {
  const { uploadUrl, publicUrl } = await requestPresignedUrl(file);
  await putToS3(uploadUrl, file, onProgress);
  return publicUrl;
};
