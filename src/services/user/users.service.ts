import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { db } from "../config/firebase.service";
import type { UserProfile } from "@/types/auth";

export const createUserProfile = async (
  uid: string,
  data: UserProfile,
): Promise<void> => {
  await setDoc(doc(db, "users", uid), data);
};

export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as UserProfile) : null;
};

export const updateUserRole = async (
  uid: string,
  role: UserProfile["role"],
): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { role });
};

export const updateUserName = async (
  uid: string,
  name: string,
): Promise<void> => {
  await updateDoc(doc(db, "users", uid), { name });
};

export const resolveOrCreateProfile = async (
  firebaseUser: FirebaseUser,
): Promise<UserProfile> => {
  const email = firebaseUser.email ?? "";
  const role = await resolveRoleFromServer(firebaseUser);
  const existing = await getUserProfile(firebaseUser.uid);

  if (!existing) {
    const newProfile: UserProfile = {
      name: firebaseUser.displayName ?? "",
      email,
      role,
    };
    await createUserProfile(firebaseUser.uid, newProfile);
    return newProfile;
  }

  if (role === "admin" && existing.role !== "admin") {
    await updateUserRole(firebaseUser.uid, "admin");
    return { ...existing, role: "admin" };
  }

  return existing;
};

// Pregunta al servidor si el usuario es admin.
// El servidor lee ADMIN_EMAILS (variable privada, nunca expuesta al browser).
// Si la API no está disponible (ej. desarrollo local con vite solo),
// cae en VITE_ADMIN_EMAILS como fallback.
async function resolveRoleFromServer(
  firebaseUser: FirebaseUser,
): Promise<UserProfile["role"]> {
  try {
    const idToken = await firebaseUser.getIdToken();
    const res = await fetch("/api/resolve-role", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      const { isAdmin } = (await res.json()) as { isAdmin: boolean };
      return isAdmin ? "admin" : "customer";
    }
  } catch {
    // API no disponible (desarrollo local sin vercel dev)
  }

  // Fallback local: usa VITE_ADMIN_EMAILS si está definida
  const localAdmins = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  const email = (firebaseUser.email ?? "").toLowerCase();
  return localAdmins.includes(email) ? "admin" : "customer";
}
