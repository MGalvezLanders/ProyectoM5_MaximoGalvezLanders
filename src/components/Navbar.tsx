import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
    const { user, profile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <Link to="/" className="text-lg font-bold text-blue-600">
                MiTienda
            </Link>

            <div className="flex items-center gap-4">
                {user ? (
                    <>
                        <Link to="/catalog" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            Catálogo
                        </Link>
                        <Link to="/cart" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            Carrito
                        </Link>
                        <Link to="/orders" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            Mis pedidos
                        </Link>
                        {profile?.role === "admin" && (
                            <Link to="/admin" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                Admin
                            </Link>
                        )}
                        <Link to="/profile" className="text-sm text-gray-700 font-medium hover:text-blue-600 transition-colors">
                            {profile?.name || user.email}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cerrar sesión
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            Iniciar sesión
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Registrarse
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
