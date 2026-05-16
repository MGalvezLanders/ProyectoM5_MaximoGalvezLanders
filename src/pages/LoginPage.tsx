import { Link } from "react-router-dom";
import { useLoginForm } from "@/hooks/useLoginForm";
import { FormField } from "@/components/FormField";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function LoginPage() {
    const {
        form,
        errors,
        isSubmitting,
        isFormInvalid,
        firebaseError,
        handleChange,
        handleSubmit,
        handleGoogleSignIn,
    } = useLoginForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
                <p className="text-sm text-gray-500 mb-6">Bienvenido de vuelta</p>

                <form onSubmit={handleSubmit} noValidate>
                    <FormField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        autoComplete="email"
                        error={errors.email}
                    />
                    <FormField
                        id="password"
                        name="password"
                        label="Contraseña"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password}
                    />

                    {firebaseError && (
                        <p className="mb-4 text-sm text-red-600 text-center" role="alert">
                            {firebaseError}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isFormInvalid}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
                    </button>

                    <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isSubmitting} />
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿No tenés cuenta?{" "}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">
                        Registrarse
                    </Link>
                </p>
            </div>
        </div>
    );
}
