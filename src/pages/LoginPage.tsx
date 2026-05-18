import { Link } from "react-router-dom";
import { useLoginForm } from "@/hooks/useLoginForm";
import { FormField } from "@/components/login-register/FormField";
import { GoogleSignInButton } from "@/components/login-register/GoogleSignInButton";
import { Button } from "@/components/ui/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";

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
    <div className="paper-texture min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <SolDeMayo className="w-12 h-12 text-sun-500" />
        </div>

        <div className="bg-cream-50 border border-sepia-300 rounded-2xl shadow-warm p-8">
          <h1 className="font-display text-3xl font-bold text-leather-900 mb-1 text-center">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-leather-600 mb-6 text-center">
            Ingresá para seguir cebándolo
          </p>

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
              <p
                className="mb-4 text-sm text-terracota-500 text-center"
                role="alert"
              >
                {firebaseError}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting || isFormInvalid}
            >
              {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
            </Button>

            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            />
          </form>

          <p className="mt-6 text-center text-sm text-leather-700">
            ¿No tenés cuenta?{" "}
            <Link
              to="/register"
              className="text-leather-900 font-semibold hover:text-sun-600 underline decoration-sun-500 underline-offset-2"
            >
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
