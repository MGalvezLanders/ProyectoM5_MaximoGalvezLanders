import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type SyntheticEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useProducts } from "@/hooks/useProducts";
import { getProductById, type ProductInput } from "@/services/products";
import {
  deleteImageByUrl,
  uploadImage,
} from "@/services/admin/uploadImage";

//* ─── Tipos del state machine ───────────────────────────────────────────────
type FormFields = {
  name: string;
  description: string;
  price: number | "";
  category: string;
  stock: number | "";
  imageUrl: string; //* URL ya guardada en Firestore (solo en edición)
};

type FormErrors = {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  stock?: string;
  image?: string;
};

type FormStatus = "editing" | "submitting" | "success" | "error";

type FormState = {
  fields: FormFields;
  errors: FormErrors;
  status: FormStatus;
  globalError: string | null;
};

const EMPTY_FIELDS: FormFields = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  imageUrl: "",
};

const INITIAL_STATE: FormState = {
  fields: EMPTY_FIELDS,
  errors: {},
  status: "editing",
  globalError: null,
};

const CATEGORIES_HINT = [
  "mates",
  "termos",
  "materas",
  "ponchos",
  "sombreros",
  "boinas",
];

//* ─── Validaciones ──────────────────────────────────────────────────────────
const validateFields = (
  fields: FormFields,
  hasImage: boolean,
): FormErrors => {
  const errors: FormErrors = {};

  if (!fields.name.trim()) errors.name = "El nombre es obligatorio";
  if (!fields.description.trim())
    errors.description = "La descripción es obligatoria";
  if (!fields.category.trim())
    errors.category = "La categoría es obligatoria";
  if (fields.price === "" || Number(fields.price) <= 0)
    errors.price = "El precio debe ser mayor a 0";
  if (fields.stock === "" || Number(fields.stock) < 0)
    errors.stock = "El stock no puede ser negativo";
  if (!hasImage) errors.image = "Subí una imagen antes de guardar";

  return errors;
};

//* ─── Componente ────────────────────────────────────────────────────────────
export default function AdminProductFormPage() {
  const { id: productId } = useParams<{ id: string }>();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();
  const { createOne, updateOne } = useProducts();

  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(isEditing);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Partial<Record<keyof FormErrors, true>>>({});

  //* Para borrar la imagen vieja de S3 si la reemplazan al editar.
  const initialImageUrlRef = useRef<string>("");

  //* ─── Cargar producto en modo edición ─────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    getProductById(productId)
      .then((product) => {
        if (cancelled) return;
        if (!product) {
          setState((prev) => ({
            ...prev,
            globalError: "Producto no encontrado",
          }));
          return;
        }
        initialImageUrlRef.current = product.imageUrl;
        setState((prev) => ({
          ...prev,
          fields: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            imageUrl: product.imageUrl,
          },
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          globalError:
            err instanceof Error ? err.message : "Error cargando producto",
        }));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  //* ─── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const isNumeric = name === "price" || name === "stock";
    const parsedValue: FormFields[keyof FormFields] = isNumeric
      ? value === ""
        ? ""
        : Number(value)
      : value;

    const updatedFields = { ...state.fields, [name]: parsedValue };
    const hasImage = Boolean(selectedFile || updatedFields.imageUrl);

    setState((prev) => ({
      ...prev,
      fields: updatedFields,
      errors: validateFields(updatedFields, hasImage),
    }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setTouched((prev) => ({ ...prev, image: true }));
    const hasImage = Boolean(file || state.fields.imageUrl);
    setState((prev) => ({
      ...prev,
      errors: validateFields(prev.fields, hasImage),
    }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    //* 1. Validar campos
    const hasImage = Boolean(selectedFile || state.fields.imageUrl);
    const errors = validateFields(state.fields, hasImage);
    if (Object.keys(errors).length > 0) {
      setTouched({
        name: true,
        description: true,
        price: true,
        category: true,
        stock: true,
        image: true,
      });
      setState((prev) => ({ ...prev, errors, globalError: null }));
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "submitting",
      globalError: null,
    }));

    try {
      //* 2. Si hay archivo nuevo → subirlo a S3
      let finalImageUrl = state.fields.imageUrl;
      if (selectedFile) {
        const { publicUrl } = await uploadImage(selectedFile);
        finalImageUrl = publicUrl;
      }

      //* 3. Armar payload para Firestore
      const payload: ProductInput = {
        name: state.fields.name.trim(),
        description: state.fields.description.trim(),
        category: state.fields.category.trim().toLowerCase(),
        price: Number(state.fields.price),
        stock: Number(state.fields.stock),
        imageUrl: finalImageUrl,
      };

      //* 4. Crear o actualizar
      if (isEditing && productId) {
        await updateOne(productId, payload);
      } else {
        await createOne(payload);
      }

      //* 5. Si en edición se reemplazó la imagen, borrar la vieja de S3
      const oldUrl = initialImageUrlRef.current;
      if (selectedFile && oldUrl && oldUrl !== finalImageUrl) {
        void deleteImageByUrl(oldUrl);
      }

      setState((prev) => ({ ...prev, status: "success" }));
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      console.error("[AdminProductFormPage] submit error:", err);
      let message = "No se pudo guardar el producto";
      if (err instanceof Error) {
        if (err.message.includes("permission-denied")) {
          message = "No tenés permiso para realizar esta acción";
        } else if (err.message.toLowerCase().includes("cors")) {
          message = "Error de CORS al subir la imagen — revisar config del bucket";
        } else if (err.message) {
          message = err.message;
        }
      }
      setState((prev) => ({
        ...prev,
        status: "error",
        globalError: message,
      }));
    }
  };

  //* ─── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  const submitting = state.status === "submitting";

  //* Solo mostrar errores de campos que el usuario ya tocó
  const visibleErrors: FormErrors = Object.fromEntries(
    Object.entries(state.errors).filter(([key]) => touched[key as keyof FormErrors])
  ) as FormErrors;

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h2 className="font-display text-2xl font-bold mb-1">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </h2>
        <p className="text-sm text-leather-600">
          Completá los datos. La imagen se sube a S3 al guardar.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Imagen" htmlFor="image" error={visibleErrors.image}>
          <ImageUploader
            existingImageUrl={state.fields.imageUrl}
            onFileSelected={handleFileSelected}
            disabled={submitting}
          />
        </Field>

        <Field label="Nombre" htmlFor="name" error={visibleErrors.name}>
          <input
            id="name"
            name="name"
            type="text"
            value={state.fields.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
            placeholder="Mate Imperial"
            disabled={submitting}
          />
        </Field>

        <Field
          label="Descripción"
          htmlFor="description"
          error={visibleErrors.description}
        >
          <textarea
            id="description"
            name="description"
            value={state.fields.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={4}
            className={inputClass}
            placeholder="Detalles del producto..."
            disabled={submitting}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field
            label="Categoría"
            htmlFor="category"
            error={visibleErrors.category}
          >
            <input
              id="category"
              name="category"
              type="text"
              list="category-suggestions"
              value={state.fields.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
              placeholder="mates"
              disabled={submitting}
            />
            <datalist id="category-suggestions">
              {CATEGORIES_HINT.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Precio (ARS)" htmlFor="price" error={visibleErrors.price}>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step={100}
              value={state.fields.price}
              onChange={handleChange}
              onBlur={handleBlur}
              className={inputClass}
              disabled={submitting}
            />
          </Field>
        </div>

        <Field label="Stock" htmlFor="stock" error={visibleErrors.stock}>
          <input
            id="stock"
            name="stock"
            type="number"
            min={0}
            value={state.fields.stock}
            onChange={handleChange}
            onBlur={handleBlur}
            className={inputClass}
            disabled={submitting}
          />
        </Field>

        {state.status === "success" && (
          <p className="text-sm text-green-600 font-medium" role="status">
            Producto guardado con éxito. Redirigiendo...
          </p>
        )}

        {state.globalError && (
          <p className="text-sm text-terracota-500" role="alert">
            {state.globalError}
          </p>
        )}

        <div className="flex gap-3 pt-2 border-t border-sepia-300">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? selectedFile
                ? "Subiendo imagen..."
                : "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear producto"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/products")}
            disabled={submitting}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg bg-cream-50 text-leather-900 border border-sepia-400 focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-leather-700 mb-1.5"
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-terracota-500 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
