import type { VercelRequest, VercelResponse } from "@vercel/node";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const URL_EXPIRES_SECONDS = 60;

const sanitizeExtension = (filename: string): string => {
  const match = filename.toLowerCase().match(/\.(jpe?g|png|webp)$/);
  return match ? match[0] : ".jpg";
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME } =
    process.env;

  if (
    !AWS_ACCESS_KEY_ID ||
    !AWS_SECRET_ACCESS_KEY ||
    !AWS_REGION ||
    !S3_BUCKET_NAME
  ) {
    console.error("[s3-presign] Faltan env vars de AWS");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const { filename, contentType, size } = (req.body ?? {}) as {
    filename?: string;
    contentType?: string;
    size?: number;
  };

  if (!filename || !contentType) {
    return res
      .status(400)
      .json({ error: "filename y contentType son requeridos" });
  }

  if (!ALLOWED_MIME.has(contentType)) {
    return res.status(400).json({
      error: `MIME no permitido. Permitidos: ${Array.from(ALLOWED_MIME).join(", ")}`,
    });
  }

  if (typeof size === "number" && size > MAX_BYTES) {
    return res.status(400).json({
      error: `Archivo demasiado grande. Máx: ${MAX_BYTES / 1024 / 1024} MB`,
    });
  }

  const ext = sanitizeExtension(filename);
  const key = `products/${Date.now()}-${randomUUID()}${ext}`;

  const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: URL_EXPIRES_SECONDS,
    });

    const publicUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("[s3-presign] Error firmando URL:", err);
    return res.status(500).json({ error: "No se pudo generar la URL" });
  }
}
