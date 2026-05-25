import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  onAuthChange,
  login,
  register,
  loginWithGoogle,
  logout,
  updateUserDisplayName,
  changeUserPassword,
} from "../services/auth.service";
import { resolveOrCreateProfile, updateUserName } from "../services/users.service";
import type { UserProfile } from "../types/auth";

type AuthContextType = {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        setProfile(
          firebaseUser ? await resolveOrCreateProfile(firebaseUser) : null,
        );
      } catch (err) {
        console.error("[AuthContext] Error resolviendo profile:", err);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    await register(email, password, name);
  };

  const handleLoginWithGoogle = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
    setProfile(null);
  };

  const handleUpdateName = async (name: string) => {
    if (!user) throw new Error("No hay sesión activa");
    const trimmed = name.trim();
    await updateUserDisplayName(trimmed);
    await updateUserName(user.uid, trimmed);
    setProfile((prev) => (prev ? { ...prev, name: trimmed } : prev));
  };

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    await changeUserPassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login: handleLogin,
        register: handleRegister,
        loginWithGoogle: handleLoginWithGoogle,
        logout: handleLogout,
        updateName: handleUpdateName,
        changePassword: handleChangePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
