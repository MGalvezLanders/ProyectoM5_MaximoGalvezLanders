import { Link } from "react-router-dom";
import { useRegisterForm } from "@/hooks/forms/useRegisterForm";
import { FormField } from "@/components/forms/FormField";
import { GoogleSignInButton } from "@/components/button/GoogleSignInButton";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";

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
    <div className="paper-texture min-h-[calc(100vh-65px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <SolDeMayo className="w-12 h-12 text-sun-500" />
        </div>

        <div className="bg-cream-50 border border-sepia-300 rounded-2xl shadow-warm p-8">
          <h1 className="font-display text-3xl font-bold text-leather-900 mb-1 text-center">
            Sumate al fogón
          </h1>
          <p className="text-sm text-leather-600 mb-6 text-center">
            Creá tu cuenta y empezá a cebar
          </p>

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
              {isSubmitting ? "Registrando..." : "Crear cuenta"}
            </Button>

            <GoogleSignInButton
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            />
          </form>

          <p className="mt-6 text-center text-sm text-leather-700">
            ¿Ya tenés cuenta?{" "}
            <Link
              to="/login"
              className="text-leather-900 font-semibold hover:text-sun-600 underline decoration-sun-500 underline-offset-2"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
