import {
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type SyntheticEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductsAdmin } from "@/hooks/admin/useProductsAdmin";
import { getProductById } from "@/services/product/products.service";
import {
  deleteImageByUrl,
  uploadImage,
} from "@/services/admin/uploadImage.service";
import type { ProductInput } from "@/services/product/products.service";
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
  if (!hasImage) errors.image = "Subí al menos una imagen antes de guardar";
  return errors;
};

export function useProductForm() {
  const { id: productId } = useParams<{ id: string }>();
  const isEditing = Boolean(productId);
  const navigate = useNavigate();
  const { createOne, updateOne } = useProductsAdmin();

  const [state, setState] = useState<ProductFormState>(INITIAL_STATE);
  const [loading, setLoading] = useState(isEditing);

  // Imágenes existentes (URLs de Firestore)
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  // Nuevos archivos elegidos por el admin
  const [newFiles, setNewFiles] = useState<File[]>([]);
  // URLs eliminadas por el admin (para borrar de S3 al guardar)
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  // Error local del uploader (tamaño de archivo, etc.)
  const [imageLocalError, setImageLocalError] = useState<string | null>(null);

  const [touched, setTouched] = useState<
    Partial<Record<keyof ProductFormErrors, true>>
  >({});

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setLoading(true);
    getProductById(productId)
      .then((product) => {
        if (cancelled || !product) return;
        // Preferir imageUrls si existe, sino construir array con imageUrl
        const urls =
          product.imageUrls && product.imageUrls.length > 0
            ? product.imageUrls
            : [product.imageUrl].filter(Boolean);

        setExistingImageUrls(urls);
        setState((prev) => ({
          ...prev,
          fields: {
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            imageUrl: urls[0] ?? "",
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
    return () => { cancelled = true; };
  }, [productId]);

  const hasImage = existingImageUrls.length > 0 || newFiles.length > 0;

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const isNumeric = name === "price" || name === "stock";
    const parsedValue: ProductFormFields[keyof ProductFormFields] = isNumeric
      ? value === "" ? "" : Number(value)
      : value;

    const updatedFields = { ...state.fields, [name]: parsedValue };
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

  // Añadir un nuevo archivo
  const handleAddFile = (file: File) => {
    setNewFiles((prev) => [...prev, file]);
    setTouched((prev) => ({ ...prev, image: true }));
    setState((prev) => ({
      ...prev,
      errors: validateFields(prev.fields, true),
    }));
  };

  // Quitar una URL existente (de Firestore)
  const handleRemoveExisting = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
    setRemovedUrls((prev) => [...prev, url]);
    const remaining = existingImageUrls.filter((u) => u !== url);
    const stillHas = remaining.length > 0 || newFiles.length > 0;
    setState((prev) => ({
      ...prev,
      errors: validateFields(prev.fields, stillHas),
    }));
  };

  // Quitar un archivo nuevo por índice
  const handleRemoveNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    const remaining = existingImageUrls.length + newFiles.length - 1;
    setState((prev) => ({
      ...prev,
      errors: validateFields(prev.fields, remaining > 0),
    }));
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateFields(state.fields, hasImage);
    if (Object.keys(errors).length > 0) {
      setTouched({ name: true, description: true, price: true, category: true, stock: true, image: true });
      setState((prev) => ({ ...prev, errors, globalError: null }));
      return;
    }

    setState((prev) => ({ ...prev, status: "submitting", globalError: null }));

    try {
      // Subir todos los archivos nuevos en paralelo
      const uploadedUrls: string[] = await Promise.all(
        newFiles.map((f) => uploadImage(f).then((r) => r.publicUrl)),
      );

      const allUrls = [...existingImageUrls, ...uploadedUrls];

      const payload: ProductInput = {
        name: state.fields.name.trim(),
        description: state.fields.description.trim(),
        category: state.fields.category.trim().toLowerCase(),
        price: Number(state.fields.price),
        stock: Number(state.fields.stock),
        imageUrl: allUrls[0],
        imageUrls: allUrls,
      };

      if (isEditing && productId) {
        await updateOne(productId, payload);
      } else {
        await createOne(payload);
      }

      // Borrar de S3 las imágenes que el admin eliminó
      for (const url of removedUrls) {
        void deleteImageByUrl(url);
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
          message = "Error de CORS al subir la imagen — revisar config del bucket";
        } else if (err.message) {
          message = err.message;
        }
      }
      setState((prev) => ({ ...prev, status: "error", globalError: message }));
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
    isEditing,
    existingImageUrls,
    newFiles,
    imageLocalError,
    setImageLocalError,
    visibleErrors,
    handleChange,
    handleBlur,
    handleAddFile,
    handleRemoveExisting,
    handleRemoveNew,
    handleSubmit,
  };
}
