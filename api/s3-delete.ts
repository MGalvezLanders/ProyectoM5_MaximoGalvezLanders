import type { VercelRequest, VercelResponse } from "@vercel/node";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

//* Borra un objeto del bucket S3 (limpieza de imágenes huérfanas).
//* Mismo patrón de auth que /api/s3-presign — solo admins.
//* Restringe el delete al prefix products/ para que un atacante con un token
//* admin válido no pueda borrar archivos arbitrarios del bucket.

const KEY_PREFIX = "products/";

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

const s3 = hasAwsConfig
  ? new S3Client({
      region: AWS_REGION!,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID!,
        secretAccessKey: AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!s3 || !S3_BUCKET_NAME) {
    console.error("[s3-delete] Faltan env vars de AWS");
    return res.status(500).json({ error: "Server misconfigured (aws)" });
  }

  const authError = await requireAdmin(req);
  if (authError) {
    return res.status(authError.status).json({ error: authError.error });
  }

  const { key } = (req.body ?? {}) as { key?: string };

  if (!key || typeof key !== "string") {
    return res.status(400).json({ error: "key requerido" });
  }

  //* 🔒 Restricción: solo se permite borrar dentro de products/.
  //* Sin esto, un admin (o un token admin filtrado) podría borrar cualquier objeto.
  if (!key.startsWith(KEY_PREFIX) || key.includes("..")) {
    return res.status(400).json({ error: "key fuera de scope permitido" });
  }

  try {
    await s3.send(
      new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: key }),
    );
    return res.status(200).json({ ok: true, key });
  } catch (err) {
    console.error("[s3-delete] Error borrando objeto:", err);
    return res.status(500).json({ error: "No se pudo borrar el objeto" });
  }
}
