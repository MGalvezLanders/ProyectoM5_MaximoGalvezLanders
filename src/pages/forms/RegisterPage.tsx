import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useRegisterForm } from "@/hooks/forms/useRegisterForm";
import { FormField } from "@/components/forms/FormField";
import { GoogleSignInButton } from "@/components/button/GoogleSignInButton";
import { Button } from "@/components/button/Button";
import { SolDeMayo } from "@/components/ui/SolDeMayo";
import { fadeUp, fadeLeft, fadeRight, stagger } from "@/utils/animations";

const panelFeatures = [
  "Comunidad de amantes del mate",
  "Productos artesanales únicos",
  "Envíos a todo el país",
];

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
    <div className="min-h-[calc(100vh-65px)] grid md:grid-cols-2">
      {/* ── Panel decorativo (solo desktop) ─────────────────────────────── */}
      <motion.div
        variants={fadeLeft}
        initial="hidden"
        animate="visible"
        className="hidden md:flex flex-col items-center justify-center bg-leather-900 relative overflow-hidden px-12 py-16"
      >
        {/* Banda patria vertical izquierda */}
        <div className="absolute left-0 top-0 bottom-0 w-2 band-argentina opacity-80" />

        {/* Sol de Mayo de fondo, muy tenue para no competir con el texto */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.2] pointer-events-none">
          <SolDeMayo className="w-[28rem] h-[28rem]" spin={90} />
        </div>

        {/* Velo más opaco sobre el sol para reforzar el contraste del texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-leather-900/85 via-leather-900/70 to-leather-900/85 pointer-events-none" />

        {/* Contenido central */}
        <div className="relative z-10 text-center max-w-xs">
          <div className="mx-auto mb-6 w-fit drop-shadow-[0_4px_18px_rgba(0,0,0,0.5)]">
            <SolDeMayo className="w-20 h-20" spin={45} />
          </div>

          <h2
            className="font-display text-5xl font-bold text-sun-400 mb-3 leading-tight tracking-tight"
            style={{
              textShadow:
                "0 1px 0 rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8), 0 0 18px rgba(0,0,0,0.6)",
            }}
          >
            Sumate al fogón
          </h2>
          <p className="text-cream-100 text-sm leading-relaxed">
            Creá tu cuenta y empezá a cebar. Una tradición que se comparte
            alrededor del fuego.
          </p>

          <ul className="mt-8 space-y-3 text-left">
            {panelFeatures.map((text) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-cream-50 font-medium">
                <span className="w-2 h-2 rounded-full bg-sun-400 flex-shrink-0 shadow-[0_0_6px_rgba(246,180,14,0.6)]" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Banda patria inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-2 band-argentina opacity-80" />
      </motion.div>

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
      </motion.div>
    </div>
  );
}
