import { createContext, useEffect, useState, type ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthChange, login, register, loginWithGoogle, logout } from "../services/auth";
import { getUserProfile } from "../services/users";
import type { UserRole } from "../types/user";
import { useAuth } from "@/hooks/useAuth";

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
    register: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // loading permanece true hasta tener el perfil con el rol
                const data = await getUserProfile(firebaseUser.uid);
                setProfile(data as UserProfile | null);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleLogin = async (email: string, password: string) => {
        await login(email, password);
    };

    const handleRegister = async (email: string, password: string) => {
        await register(email, password);
    };

    const handleLoginWithGoogle = async () => {
        await loginWithGoogle();
    };

    const handleLogout = async () => {
        await logout();
        setProfile(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            login: handleLogin,
            register: handleRegister,
            loginWithGoogle: handleLoginWithGoogle,
            logout: handleLogout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

useAuth();