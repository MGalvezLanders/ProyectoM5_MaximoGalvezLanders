import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
  type NextOrObserver,
} from "firebase/auth";
import { auth } from "./config/firebase.service";
import { createUserProfile } from "./user/users.service";

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

export const updateUserDisplayName = async (name: string): Promise<void> => {
  if (!auth.currentUser) throw new Error("No hay sesión activa");
  await updateProfile(auth.currentUser, { displayName: name });
};

export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No hay sesión activa");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};
