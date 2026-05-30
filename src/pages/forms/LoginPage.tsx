import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useLoginForm } from "@/hooks/forms/useLoginForm";
import { FormField } from "@/components/forms/FormField";
import { GoogleSignInButton } from "@/components/button/GoogleSignInButton";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { AuthPanel } from "@/components/forms/AuthPanel";
import { fadeUp, fadeRight, stagger } from "@/utils/animations";

const PANEL_FEATURES = [
  "Cuero genuino del litoral",
  "Mates curados a mano",
  "Envíos a todo el país",
] as const;

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
    <div className="min-h-[calc(100vh-65px)] grid md:grid-cols-2">
      <AuthPanel
        title="La Gauchada"
        subtitle="Mates, materas y cuero genuino argentino. Hecho a mano, pensado para compartir."
        features={PANEL_FEATURES}
      />

      {/* ── Panel del formulario ─────────────────────────────────────────── */}
      <motion.div
        variants={fadeRight}
        initial="hidden"
        animate="visible"
        className="paper-texture flex items-center justify-center px-6 py-12"
      >
        <div className="w-full max-w-sm">
          {/* Sol de Mayo en mobile */}
          <div className="flex justify-center mb-6 md:hidden">
            <SolDeMayo className="w-12 h-12" />
          </div>

          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="mb-6">
              <h1 className="font-display text-3xl font-bold text-leather-900 mb-1">
                Bienvenido de vuelta
              </h1>
              <p className="text-sm text-leather-600">
                Ingresá para seguir cebándolo
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} noValidate>
              <motion.div variants={fadeUp}>
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
              </motion.div>

              <motion.div variants={fadeUp}>
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
              </motion.div>

              {firebaseError && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 text-sm text-terracota-500 text-center"
                  role="alert"
                >
                  {firebaseError}
                </motion.p>
              )}

              <motion.div variants={fadeUp}>
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
              </motion.div>
            </form>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-center text-sm text-leather-700"
            >
              ¿No tenés cuenta?{" "}
              <Link
                to="/register"
                className="text-leather-900 font-semibold hover:text-sun-600 underline decoration-sun-500 underline-offset-2"
              >
                Registrarse
              </Link>
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
