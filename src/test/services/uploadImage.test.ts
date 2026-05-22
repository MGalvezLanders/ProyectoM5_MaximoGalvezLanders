import { describe, expect, test, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../msw/server";
import {
  FAKE_S3_HOST,
  presignedUploadUrl,
  publicUrlFor,
} from "../msw/handlers";
import {
  deleteImage,
  deleteImageByUrl,
  extractKeyFromUrl,
  uploadImage,
} from "@/services/admin/uploadImage.service";

// Único mock SDK necesario: getAuth() viene del SDK modular de Firebase, no
// hace HTTP plano. La lección recomienda vi.mock para SDKs; el resto del flujo
// (presign + PUT a S3 + delete) corre contra handlers MSW reales.
const getAuthMock = vi.fn();
vi.mock("firebase/auth", () => ({
  getAuth: () => getAuthMock(),
}));

beforeEach(() => {
  getAuthMock.mockReturnValue({
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue("fake-id-token"),
    },
  });
});

function makeFile(name = "test.png", type = "image/png", size = 1024): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe("uploadImage (happy path)", () => {
  test("pide presign, hace PUT a S3 y devuelve publicUrl + key", async () => {
    const file = makeFile("mate.png");

    const result = await uploadImage(file);

    expect(result.key).toBe("products/test-mate.png");
    expect(result.publicUrl).toBe(publicUrlFor("products/test-mate.png"));
  });

  test("envía Bearer token y body correcto al endpoint de presign", async () => {
    let capturedAuth: string | null = null;
    let capturedBody: unknown = null;

    server.use(
      http.post("*/api/s3-presign", async ({ request }) => {
        capturedAuth = request.headers.get("authorization");
        capturedBody = await request.json();
        const key = "products/captured.png";
        return HttpResponse.json({
          uploadUrl: presignedUploadUrl(key),
          publicUrl: publicUrlFor(key),
          key,
        });
      }),
    );

    const file = makeFile("captured.png", "image/png", 2048);
    await uploadImage(file);

    expect(capturedAuth).toBe("Bearer fake-id-token");
    expect(capturedBody).toEqual({
      filename: "captured.png",
      contentType: "image/png",
      size: 2048,
    });
  });
});

describe("uploadImage (errores)", () => {
  test("propaga el mensaje de error que devuelve /api/s3-presign", async () => {
    server.use(
      http.post("*/api/s3-presign", () =>
        HttpResponse.json(
          { error: "Solo admins pueden subir imágenes" },
          { status: 403 },
        ),
      ),
    );

    await expect(uploadImage(makeFile())).rejects.toThrow(
      "Solo admins pueden subir imágenes",
    );
  });

  test("usa fallback con status code si /api/s3-presign no devuelve body JSON", async () => {
    server.use(
      http.post(
        "*/api/s3-presign",
        () => new HttpResponse("Internal Server Error", { status: 500 }),
      ),
    );

    await expect(uploadImage(makeFile())).rejects.toThrow(
      /No se pudo obtener la URL de subida \(500\)/,
    );
  });

  test("parsea el XML de error de S3 (AccessDenied) y lo expone en el mensaje", async () => {
    server.use(
      http.put(
        `${FAKE_S3_HOST}/*`,
        () =>
          new HttpResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<Error><Code>AccessDenied</Code><Message>Request has expired</Message></Error>`,
            { status: 403, headers: { "Content-Type": "application/xml" } },
          ),
      ),
    );

    await expect(uploadImage(makeFile())).rejects.toThrow(
      /S3 403 AccessDenied: Request has expired/,
    );
  });

  test("rechaza si el usuario no está logueado (sin currentUser)", async () => {
    getAuthMock.mockReturnValueOnce({ currentUser: null });

    await expect(uploadImage(makeFile())).rejects.toThrow(
      /Necesitás iniciar sesión/,
    );
  });
});

describe("deleteImage", () => {
  test("hace POST a /api/s3-delete con la key y el bearer token", async () => {
    let capturedBody: unknown = null;
    let capturedAuth: string | null = null;

    server.use(
      http.post("*/api/s3-delete", async ({ request }) => {
        capturedAuth = request.headers.get("authorization");
        capturedBody = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );

    await deleteImage("products/old.png");

    expect(capturedAuth).toBe("Bearer fake-id-token");
    expect(capturedBody).toEqual({ key: "products/old.png" });
  });

  test("falla silenciosamente si /api/s3-delete devuelve error (solo loguea)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    server.use(
      http.post("*/api/s3-delete", () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 }),
      ),
    );

    // No debe lanzar — el cleanup de huérfanos no rompe la UX.
    await expect(deleteImage("missing")).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe("extractKeyFromUrl", () => {
  test("extrae la key de una URL del bucket S3", () => {
    expect(
      extractKeyFromUrl(
        "https://my-bucket.s3.us-east-1.amazonaws.com/products/123-uuid.jpg",
      ),
    ).toBe("products/123-uuid.jpg");
  });

  test("decodifica caracteres URL-encoded en la key", () => {
    expect(
      extractKeyFromUrl(
        "https://my-bucket.s3.us-east-1.amazonaws.com/products/mate%20imperial.jpg",
      ),
    ).toBe("products/mate imperial.jpg");
  });

  test("devuelve null si la URL no es de un bucket S3", () => {
    expect(extractKeyFromUrl("https://placeholder.com/image.png")).toBeNull();
    expect(extractKeyFromUrl("")).toBeNull();
  });
});

describe("deleteImageByUrl", () => {
  test("convierte URL pública a key y llama /api/s3-delete", async () => {
    let capturedBody: { key?: string } | null = null;
    server.use(
      http.post("*/api/s3-delete", async ({ request }) => {
        capturedBody = (await request.json()) as { key?: string };
        return HttpResponse.json({ ok: true });
      }),
    );

    await deleteImageByUrl(
      "https://bucket.s3.us-east-1.amazonaws.com/products/abc.jpg",
    );

    expect(capturedBody).toEqual({ key: "products/abc.jpg" });
  });

  test("es no-op si la URL no pertenece al bucket (no pega a /api/s3-delete)", async () => {
    let called = false;
    server.use(
      http.post("*/api/s3-delete", () => {
        called = true;
        return HttpResponse.json({ ok: true });
      }),
    );

    await deleteImageByUrl("https://placeholder.com/img.png");

    expect(called).toBe(false);
  });
});
