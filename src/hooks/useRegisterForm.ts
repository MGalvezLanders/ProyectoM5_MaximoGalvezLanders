import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

type FormState = { name: string; email: string; password: string; confirmPassword: string };
type FormErrors = Partial<FormState>;

function validate(form: FormState): FormErrors {
    const errors: FormErrors = {};
    if (!form.name.trim()) errors.name = "El nombre es requerido";
    if (!form.email) errors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email inválido";
    if (!form.password) errors.password = "La contraseña es requerida";
    else if (form.password.length < 6) errors.password = "Mínimo 6 caracteres";
    if (!form.confirmPassword) errors.confirmPassword = "Confirmá tu contraseña";
    else if (form.confirmPassword !== form.password) errors.confirmPassword = "Las contraseñas no coinciden";
    return errors;
}

function getFirebaseErrorMessage(err: unknown): string {
    if (err && typeof err === "object" && "code" in err) {
        const code = (err as { code: string }).code;
        if (code === "auth/email-already-in-use") return "Ya existe una cuenta con ese email";
        if (code === "auth/too-many-requests") return "Demasiados intentos. Intentá más tarde";
    }
    return "Ocurrió un error. Intentá de nuevo";
}

export function useRegisterForm() {
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<FormState>({ name: "", email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [firebaseError, setFirebaseError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const updated = { ...form, [e.target.name]: e.target.value };
        setForm(updated);
        setErrors(validate(updated));
        setFirebaseError(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);
        try {
            await register(form.email, form.password);
            navigate("/");
        } catch (err) {
            setFirebaseError(getFirebaseErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await loginWithGoogle();
            navigate("/");
        } catch (err) {
            setFirebaseError(getFirebaseErrorMessage(err));
        }
    };

    const isFormInvalid = Object.keys(errors).length > 0;

    return { form, errors, isSubmitting, isFormInvalid, firebaseError, handleChange, handleSubmit, handleGoogleSignIn };
}
