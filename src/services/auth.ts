import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    type User,
    type NextOrObserver,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile } from "./users";

const googleProvider = new GoogleAuthProvider();

export const register = async (email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(credential.user.uid, { name: "", email, role: "customer" });
    return credential;
};

export const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

export const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export const onAuthChange = (callback: NextOrObserver<User>) =>
    onAuthStateChanged(auth, callback);
