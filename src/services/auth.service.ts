import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
  type NextOrObserver,
} from "firebase/auth";
import { auth } from "./firebase.service";
import { createUserProfile } from "./users.service";

const googleProvider = new GoogleAuthProvider();

export const register = async (
  email: string,
  password: string,
  name: string,
) => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const trimmedName = name.trim();
  await updateProfile(credential.user, { displayName: trimmedName });
  await createUserProfile(credential.user.uid, {
    name: trimmedName,
    email,
    role: "customer",
  });
  return credential;
};

export const login = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export const onAuthChange = (callback: NextOrObserver<User>) =>
  onAuthStateChanged(auth, callback);
