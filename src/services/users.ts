import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { UserRole } from "../types/user";

type UserProfileData = {
    name: string;
    email: string;
    role: UserRole;
};

export const createUserProfile = async (uid: string, data: UserProfileData) => {
    const userDoc = doc(db, "users", uid);
    await setDoc(userDoc, data);
};

export const getUserProfile = async (uid: string) => {
    const userDoc = doc(db, "users", uid);
    const snapshot = await getDoc(userDoc);
    return snapshot.exists() ? snapshot.data() : null;
};
