import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { useAuthError } from "./errors/useAuthError";

type FormState = { email: string; password: string };
type FormErrors = Partial<FormState>;

function validate(form: FormState): FormErrors {
    const errors: FormErrors = {};
    if (!form.email) errors.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Email inválido";
    if (!form.password) errors.password = "La contraseña es requerida";
    else if (form.password.length < 6) errors.password = "Mínimo 6 caracteres";
    return errors;
}

export function useLoginForm() {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const { error: firebaseError, captureError, clearError } = useAuthError();

    const [form, setForm] = useState<FormState>({ email: "", password: "" });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const updated = { ...form, [e.target.name]: e.target.value };
        setForm(updated);
        setErrors(validate(updated));
        clearError();
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
            await login(form.email, form.password);
            navigate("/");
        } catch (err) {
            captureError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await loginWithGoogle();
            navigate("/");
        } catch (err) {
            captureError(err);
        }
    };

    const isFormInvalid = Object.keys(errors).length > 0;

    return { form, errors, isSubmitting, isFormInvalid, firebaseError, handleChange, handleSubmit, handleGoogleSignIn };
}
