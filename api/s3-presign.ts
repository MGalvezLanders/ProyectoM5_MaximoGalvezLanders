import type { VercelRequest, VercelResponse } from "@vercel/node";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

//* ─── Tipos MIME permitidos y su extensión canónica ─────────────────────────
//* Derivamos la extensión del MIME (validado) en lugar del filename (no confiable).
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const MAX_BYTES = 5 * 1024 * 1024; //* 5 MB
const URL_EXPIRES_SECONDS = 60; //* expiración corta: solo el tiempo de subida
const KEY_PREFIX = "products";

//* ─── Env vars de AWS ───────────────────────────────────────────────────────
const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  S3_BUCKET_NAME,
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  ADMIN_EMAILS,
} = process.env;

const hasAwsConfig =
  !!AWS_ACCESS_KEY_ID &&
  !!AWS_SECRET_ACCESS_KEY &&
  !!AWS_REGION &&
  !!S3_BUCKET_NAME;

const hasFirebaseConfig =
  !!FIREBASE_PROJECT_ID && !!FIREBASE_CLIENT_EMAIL && !!FIREBASE_PRIVATE_KEY;

//* Cliente S3 a nivel de módulo: reutilizado entre invocaciones (warm starts).
const s3 = hasAwsConfig
  ? new S3Client({
      region: AWS_REGION!,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    })
  : null;

//* ─── Firebase Admin (verificación de ID token) ─────────────────────────────
let firebaseApp: App | null = null;
const getFirebaseAdmin = (): App | null => {
  if (firebaseApp) return firebaseApp;
  if (!hasFirebaseConfig) return null;
  const existing = getApps();
  firebaseApp =
    existing[0] ??
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID!,
        clientEmail: FIREBASE_CLIENT_EMAIL!,
        //* Vercel guarda la privateKey con \n literales — hay que reemplazarlos.
        privateKey: FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });
  return firebaseApp;
};

const ADMIN_EMAIL_SET = new Set(
  (ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

//* ─── Helpers ───────────────────────────────────────────────────────────────
const slugifyFilename = (filename: string): string => {
  const base = filename.replace(/\.[^.]+$/, "");
  const slug = base
    .toLowerCase()
    .normalize("NFD")
    //* \p{M} matchea combining marks (acentos, tildes) — explícito y robusto.
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return slug || "file";
};

//* Verifica el header `Authorization: Bearer <idToken>` y exige que el usuario
//* esté en ADMIN_EMAILS. Devuelve `null` si todo OK, o un objeto con status/error.
const requireAdmin = async (
  req: VercelRequest,
): Promise<{ status: number; error: string } | null> => {
  const admin = getFirebaseAdmin();
  if (!admin) {
    return { status: 500, error: "Server misconfigured (firebase admin)" };
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { status: 401, error: "Missing or malformed Authorization header" };
  }
  const idToken = authHeader.slice("Bearer ".length).trim();
  if (!idToken) return { status: 401, error: "Missing ID token" };

  let decoded;
  try {
    decoded = await getAuth(admin).verifyIdToken(idToken);
  } catch {
    return { status: 401, error: "Invalid or expired ID token" };
  }

  const email = decoded.email?.toLowerCase();
  if (!email || !ADMIN_EMAIL_SET.has(email)) {
    return { status: 403, error: "Forbidden: admin access required" };
  }

  return null;
};

//* ─── Handler ───────────────────────────────────────────────────────────────
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  //* CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!s3 || !S3_BUCKET_NAME || !AWS_REGION) {
    console.error("[s3-presign] Faltan env vars de AWS");
    return res.status(500).json({ error: "Server misconfigured (aws)" });
  }

  //* 🔒 Auth: solo admins pueden generar URLs firmadas.
  const authError = await requireAdmin(req);
  if (authError) {
    return res.status(authError.status).json({ error: authError.error });
  }

  const { filename, contentType, size } = (req.body ?? {}) as {
    filename?: string;
    contentType?: string;
    size?: number;
  };

  //* Validación de entrada
  if (!filename || !contentType) {
    return res
      .status(400)
      .json({ error: "filename y contentType son requeridos" });
  }

  const ext = EXTENSION_BY_MIME[contentType];
  if (!ext) {
    return res.status(400).json({
      error: `MIME no permitido. Permitidos: ${Object.keys(EXTENSION_BY_MIME).join(", ")}`,
    });
  }

  if (typeof size === "number" && size > MAX_BYTES) {
    return res.status(400).json({
      error: `Archivo demasiado grande. Máx: ${MAX_BYTES / 1024 / 1024} MB`,
    });
  }

  const slug = slugifyFilename(filename);
  const key = `${KEY_PREFIX}/${Date.now()}-${randomUUID()}-${slug}${ext}`;

  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(s3, command, {
      expiresIn: URL_EXPIRES_SECONDS,
    });

    const publicUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;

    return res.status(200).json({
      uploadUrl,
      publicUrl,
      key,
      expiresIn: URL_EXPIRES_SECONDS,
    });
  } catch (err) {
    console.error("[s3-presign] Error firmando URL:", err);
    return res.status(500).json({ error: "No se pudo generar la URL" });
  }
}
