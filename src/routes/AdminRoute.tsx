import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

export function AdminRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner className="w-10 h-10" />
        <p className="text-sm text-leather-600">Verificando permisos...</p>
      </div>
    );
  }

  if (!user || profile?.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
