import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth";
import { db } from "./firebase.service";
import { isAdminEmail } from "../utils/admin";
import type { UserProfile } from "../types/auth";

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

export const resolveOrCreateProfile = async (
  firebaseUser: FirebaseUser,
): Promise<UserProfile> => {
  const email = firebaseUser.email ?? "";
  const shouldBeAdmin = isAdminEmail(email);
  const existing = await getUserProfile(firebaseUser.uid);

  if (!existing) {
    const newProfile: UserProfile = {
      name: firebaseUser.displayName ?? "",
      email,
      role: shouldBeAdmin ? "admin" : "customer",
    };
    await createUserProfile(firebaseUser.uid, newProfile);
    return newProfile;
  }

  if (shouldBeAdmin && existing.role !== "admin") {
    await updateUserRole(firebaseUser.uid, "admin");
    return { ...existing, role: "admin" };
  }

  return existing;
};
