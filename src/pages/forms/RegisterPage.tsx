import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useRegisterForm } from "@/hooks/forms/useRegisterForm";
import { FormField } from "@/components/forms/FormField";
import { GoogleSignInButton } from "@/components/button/GoogleSignInButton";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { fadeUp, stagger } from "@/utils/animations";

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
    <div className="w-full max-w-sm">
      {/* Sol de Mayo en mobile */}
      <div className="flex justify-center mb-6 md:hidden">
        <SolDeMayo className="w-12 h-12" />
      </div>

      <motion.div variants={stagger} initial="hidden" animate="visible">
        <motion.div variants={fadeUp} className="mb-6">
          <h1 className="font-display text-3xl font-bold text-leather-900 mb-1">
            Sumate al fogón
          </h1>
          <p className="text-sm text-leather-600">
            Creá tu cuenta y empezá a cebar
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} noValidate>
          <motion.div variants={fadeUp}>
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
          </motion.div>

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
              autoComplete="new-password"
              error={errors.password}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
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
              {isSubmitting ? "Registrando..." : "Crear cuenta"}
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
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            className="text-leather-900 font-semibold hover:text-sun-600 underline decoration-sun-500 underline-offset-2"
          >
            Iniciar sesión
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
