import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/button/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthError } from "@/hooks/errors/useAuthError";

function Avatar({ name, email }: { name: string; email: string }) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : email[0].toUpperCase();

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-sun-400 text-leather-900 flex items-center justify-center text-2xl font-bold font-display shadow-warm-sm shrink-0">
        {initials}
      </div>
      <div>
        <p className="font-display text-xl font-bold text-leather-900">
          {name || "Sin nombre"}
        </p>
        <p className="text-sm text-leather-600">{email}</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream-50 border border-sepia-300 rounded-xl p-6 shadow-warm-sm">
      <h2 className="font-display text-lg font-semibold text-leather-900 mb-4 pb-3 border-b border-sepia-200">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-2.5 border-b border-sepia-100 last:border-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-leather-500 sm:w-36 shrink-0">
        {label}
      </span>
      <span className="text-sm text-leather-800">{value}</span>
    </div>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  customer: "Defender el proyecto con mi vida",
};

const ProfilePage = () => {
  const { user, profile, updateName, changePassword } = useAuth();

  // Edit name
  const [nameValue, setNameValue] = useState(profile?.name ?? "");
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const {
    error: nameError,
    captureError: captureNameError,
    clearError: clearNameError,
  } = useAuthError();

  // Change password
  const [pwForm, setPwForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const {
    error: pwError,
    captureError: capturePwError,
    clearError: clearPwError,
  } = useAuthError();
  const [pwConfirmError, setPwConfirmError] = useState("");

  const isEmailProvider =
    user?.providerData.some((p) => p.providerId === "password") ?? false;

  const memberSince = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNameError();
    setNameSuccess(false);
    if (!nameValue.trim()) return;
    setNameSaving(true);
    try {
      await updateName(nameValue);
      setNameSuccess(true);
    } catch (err) {
      captureNameError(err);
    } finally {
      setNameSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearPwError();
    setPwSuccess(false);
    setPwConfirmError("");

    if (pwForm.next !== pwForm.confirm) {
      setPwConfirmError("Las contraseñas no coinciden");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwConfirmError("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    setPwSaving(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      capturePwError(err);
    } finally {
      setPwSaving(false);
    }
  };

  if (!user || !profile) return null;

  return (
    <main className="paper-texture min-h-[calc(100vh-65px)]">
      <Container size="md" className="py-10 space-y-6">
        <h1 className="font-display text-3xl font-bold text-leather-900">
          Mi perfil
        </h1>

        {/* Resumen */}
        <SectionCard title="Información de la cuenta">
          <div className="mb-5">
            <Avatar name={profile.name} email={profile.email} />
          </div>
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Nombre" value={profile.name || "—"} />
          <InfoRow
            label="Rol"
            value={ROLE_LABELS[profile.role] ?? profile.role}
          />
          <InfoRow label="Miembro desde" value={memberSince} />
          <InfoRow
            label="Proveedor"
            value={isEmailProvider ? "Email y contraseña" : "Google"}
          />
        </SectionCard>

        {/* Editar nombre */}
        <SectionCard title="Editar nombre">
          <form onSubmit={handleSaveName} noValidate>
            <FormField
              id="profile-name"
              label="Nombre completo"
              type="text"
              value={nameValue}
              onChange={(e) => {
                setNameValue(e.target.value);
                setNameSuccess(false);
                clearNameError();
              }}
              placeholder="Tu nombre"
              autoComplete="name"
              error={nameError ?? undefined}
            />
            {nameSuccess && (
              <p className="text-sm text-emerald-600 mb-3">
                Nombre actualizado correctamente.
              </p>
            )}
            <Button
              type="submit"
              disabled={
                nameSaving ||
                !nameValue.trim() ||
                nameValue.trim() === profile.name
              }
            >
              {nameSaving ? "Guardando…" : "Guardar nombre"}
            </Button>
          </form>
        </SectionCard>

        {/* Cambiar contraseña — solo para usuarios email/password */}
        {isEmailProvider && (
          <SectionCard title="Cambiar contraseña">
            <form
              onSubmit={handleChangePassword}
              noValidate
              className="space-y-0"
            >
              <FormField
                id="pw-current"
                label="Contraseña actual"
                type="password"
                value={pwForm.current}
                onChange={(e) => {
                  setPwForm((f) => ({ ...f, current: e.target.value }));
                  clearPwError();
                  setPwSuccess(false);
                }}
                placeholder="••••••••"
                autoComplete="current-password"
                error={pwError ?? undefined}
              />
              <FormField
                id="pw-new"
                label="Nueva contraseña"
                type="password"
                value={pwForm.next}
                onChange={(e) => {
                  setPwForm((f) => ({ ...f, next: e.target.value }));
                  setPwConfirmError("");
                  setPwSuccess(false);
                }}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
              <FormField
                id="pw-confirm"
                label="Confirmar nueva contraseña"
                type="password"
                value={pwForm.confirm}
                onChange={(e) => {
                  setPwForm((f) => ({ ...f, confirm: e.target.value }));
                  setPwConfirmError("");
                  setPwSuccess(false);
                }}
                placeholder="Repetí la nueva contraseña"
                autoComplete="new-password"
                error={pwConfirmError || undefined}
              />
              {pwSuccess && (
                <p className="text-sm text-emerald-600 mb-3">
                  Contraseña actualizada correctamente.
                </p>
              )}
              <Button
                type="submit"
                disabled={
                  pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm
                }
              >
                {pwSaving ? "Actualizando…" : "Cambiar contraseña"}
              </Button>
            </form>
          </SectionCard>
        )}
      </Container>
    </main>
  );
};

export default ProfilePage;
