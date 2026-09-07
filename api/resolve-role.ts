import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, ADMIN_EMAILS } =
  process.env;

let firebaseApp: App | null = null;
const getFirebaseAdmin = (): App | null => {
  if (firebaseApp) return firebaseApp;
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) return null;
  const existing = getApps();
  firebaseApp =
    existing[0] ??
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const admin = getFirebaseAdmin();
  if (!admin) return res.status(500).json({ error: "Server misconfigured" });

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }

  const idToken = authHeader.slice("Bearer ".length).trim();

  let decoded;
  try {
    decoded = await getAuth(admin).verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const email = decoded.email?.toLowerCase() ?? "";
  return res.status(200).json({ isAdmin: ADMIN_EMAIL_SET.has(email) });
}
