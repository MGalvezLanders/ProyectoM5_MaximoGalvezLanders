import { http, HttpResponse } from "msw";

// Host ficticio para la presigned URL. NO se conecta a S3 real:
// MSW intercepta la request y responde según los handlers de abajo.
export const FAKE_S3_HOST = "https://s3.fake.test";
export const FAKE_PUBLIC_HOST = "https://cdn.fake.test";

// Helpers para que los tests construyan URLs consistentes con el handler default.
export const presignedUploadUrl = (key: string) =>
  `${FAKE_S3_HOST}/${key}?X-Amz-Signature=stub`;
export const publicUrlFor = (key: string) => `${FAKE_PUBLIC_HOST}/${key}`;

// Handlers default (happy path). Tests individuales pueden sobreescribir con
// server.use(...) para forzar errores de presign o de S3.
export const handlers = [
  // POST /api/s3-presign → devuelve la URL firmada + la URL pública.
  // Wildcard de host (*) para que matchee tanto rutas relativas como absolutas
  // que jsdom resuelva a http://localhost/api/s3-presign.
  http.post("*/api/s3-presign", async ({ request }) => {
    const body = (await request.json()) as {
      filename?: string;
      contentType?: string;
      size?: number;
    };

    if (!body?.filename || !body?.contentType) {
      return HttpResponse.json(
        { error: "filename y contentType son obligatorios" },
        { status: 400 },
      );
    }

    const key = `products/test-${body.filename}`;
    return HttpResponse.json({
      uploadUrl: presignedUploadUrl(key),
      publicUrl: publicUrlFor(key),
      key,
    });
  }),

  // PUT a la presigned URL → S3 responde 200 sin body (happy path).
  http.put(`${FAKE_S3_HOST}/*`, () => new HttpResponse(null, { status: 200 })),

  // POST /api/s3-delete → 200 con { ok: true }.
  http.post("*/api/s3-delete", async ({ request }) => {
    const body = (await request.json()) as { key?: string };
    if (!body?.key) {
      return HttpResponse.json({ error: "key es obligatorio" }, { status: 400 });
    }
    return HttpResponse.json({ ok: true });
  }),
];
