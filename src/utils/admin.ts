/**
 * Lista de emails que se promueven automáticamente a role 'admin' al loguearse.
 * Se configura via VITE_ADMIN_EMAILS en .env (separados por coma).
 */
const ADMIN_EMAILS: string[] = (import.meta.env.VITE_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
