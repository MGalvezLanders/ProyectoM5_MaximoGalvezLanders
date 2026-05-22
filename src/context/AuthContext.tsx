import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import {
  onAuthChange,
  login,
  register,
  loginWithGoogle,
  logout,
} from "../services/auth.service";
import {
  createUserProfile,
  getUserProfile,
  updateUserRole,
} from "../services/users.service";
import type { UserRole } from "../types/user";
import { isAdminEmail } from "../utils/admin";

type UserProfile = {
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextType = {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const resolveProfile = async (
  firebaseUser: FirebaseUser,
): Promise<UserProfile> => {
  const email = firebaseUser.email ?? "";
  const shouldBeAdmin = isAdminEmail(email);

  const existing = (await getUserProfile(
    firebaseUser.uid,
  )) as UserProfile | null;

  // 1) No existe: crear profile (caso Google o doc borrado)
  if (!existing) {
    const newProfile: UserProfile = {
      name: firebaseUser.displayName ?? "",
      email,
      role: shouldBeAdmin ? "admin" : "customer",
    };
    await createUserProfile(firebaseUser.uid, newProfile);
    return newProfile;
  }

  // 2) Existe pero el email es admin y todavía no tiene role admin: promover
  if (shouldBeAdmin && existing.role !== "admin") {
    await updateUserRole(firebaseUser.uid, "admin");
    return { ...existing, role: "admin" };
  }

  return existing;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      try {
        if (firebaseUser) {
          setProfile(await resolveProfile(firebaseUser));
        } else {
          setProfile(null);
        }
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

  const handleRegister = async (
    email: string,
    password: string,
    name: string,
  ) => {
    await register(email, password, name);
  };

  const handleLoginWithGoogle = async () => {
    await loginWithGoogle();
  };

  const handleLogout = async () => {
    await logout();
    setProfile(null);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
