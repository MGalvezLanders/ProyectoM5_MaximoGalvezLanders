import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type SyntheticEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductsAdmin } from "@/hooks/useProductsAdmin";
import { getProductById } from "@/services/products.service";
import {
  deleteImageByUrl,
  uploadImage,
} from "@/services/admin/uploadImage.service";
import type { ProductInput } from "@/services/products.service";
import type {
  ProductFormErrors,
  ProductFormFields,
  ProductFormState,
} from "@/types/productForm";

const EMPTY_FIELDS: ProductFormFields = {
  name: "",
  description: "",
  price: "",
  category: "",
  stock: "",
  imageUrl: "",
};

const INITIAL_STATE: ProductFormState = {
  fields: EMPTY_FIELDS,
  errors: {},
  status: "editing",
  globalError: null,
};

const validateFields = (
  fields: ProductFormFields,
  hasImage: boolean,
): ProductFormErrors => {
  const errors: ProductFormErrors = {};
  if (!fields.name.trim()) errors.name = "El nombre es obligatorio";
  if (!fields.description.trim())
    errors.description = "La descripción es obligatoria";
  if (!fields.category.trim()) errors.category = "La categoría es obligatoria";
  if (fields.price === "" || Number(fields.price) <= 0)
    errors.price = "El precio debe ser mayor a 0";
  if (fields.stock === "" || Number(fields.stock) < 0)
    errors.stock = "El stock no puede ser negativo";
  if (!hasImage) errors.image = "Subí una imagen antes de guardar";
  return errors;
};

export function useProductForm() {
  const { id: productId } = useParams<{ id: string }>();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();
  const { createOne, updateOne } = useProductsAdmin();

  const [state, setState] = useState<ProductFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(isEditing);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<
    Partial<Record<keyof ProductFormErrors, true>>
  >({});

  const initialImageUrlRef = useRef<string>("");

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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const isNumeric = name === "price" || name === "stock";
    const parsedValue: ProductFormFields[keyof ProductFormFields] = isNumeric
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

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

    setState((prev) => ({ ...prev, status: "submitting", globalError: null }));

    try {
      let finalImageUrl = state.fields.imageUrl;
      if (selectedFile) {
        const { publicUrl } = await uploadImage(selectedFile);
        finalImageUrl = publicUrl;
      }

      const payload: ProductInput = {
        name: state.fields.name.trim(),
        description: state.fields.description.trim(),
        category: state.fields.category.trim().toLowerCase(),
        price: Number(state.fields.price),
        stock: Number(state.fields.stock),
        imageUrl: finalImageUrl,
      };

      if (isEditing && productId) {
        await updateOne(productId, payload);
      } else {
        await createOne(payload);
      }

      const oldUrl = initialImageUrlRef.current;
      if (selectedFile && oldUrl && oldUrl !== finalImageUrl) {
        void deleteImageByUrl(oldUrl);
      }

      setState((prev) => ({ ...prev, status: "success" }));
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (err) {
      console.error("[useProductForm] submit error:", err);
      let message = "No se pudo guardar el producto";
      if (err instanceof Error) {
        if (err.message.includes("permission-denied")) {
          message = "No tenés permiso para realizar esta acción";
        } else if (err.message.toLowerCase().includes("cors")) {
          message =
            "Error de CORS al subir la imagen — revisar config del bucket";
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

  const visibleErrors: ProductFormErrors = Object.fromEntries(
    Object.entries(state.errors).filter(
      ([key]) => touched[key as keyof ProductFormErrors],
    ),
  ) as ProductFormErrors;

  return {
    state,
    loading,
    selectedFile,
    isEditing,
    visibleErrors,
    handleChange,
    handleBlur,
    handleFileSelected,
    handleSubmit,
  };
}
