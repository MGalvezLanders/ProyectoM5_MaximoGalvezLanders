import { Link } from "react-router-dom";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { FormField } from "@/components/FormField";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function RegisterPage() {
    const {
        form,
        errors,
        isSubmitting,
        isFormInvalid,
        firebaseError,
        handleChange,
        handleSubmit,
        handleGoogleSignIn,
    } = useRegisterForm();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Crear cuenta</h1>
                <p className="text-sm text-gray-500 mb-6">Completá tus datos para registrarte</p>

                <form onSubmit={handleSubmit} noValidate>
                    <FormField
                        id="name"
                        name="name"
                        label="Nombre"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        autoComplete="name"
                        error={errors.name}
                    />
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
                        autoComplete="new-password"
                        error={errors.password}
                    />
                    <FormField
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirmar contraseña"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        error={errors.confirmPassword}
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
                        {isSubmitting ? "Registrando..." : "Crear cuenta"}
                    </button>

                    <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isSubmitting} />
                </form>

                <p className="mt-6 text-center text-sm text-gray-600">
                    ¿Ya tenés cuenta?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
