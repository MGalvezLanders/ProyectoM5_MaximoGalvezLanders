import type { ChangeEvent, FocusEvent, ReactNode, SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/button/Button";
import { MultiImageUploader } from "@/components/admin/MultiImageUploader";
import { PRODUCT_CATEGORIES } from "@/utils/categories";
import type {
  ProductFormErrors,
  ProductFormFields,
  ProductFormStatus,
} from "@/types/productForm";

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
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-leather-700 mb-1.5">
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

type ProductFormProps = {
  fields: ProductFormFields;
  errors: ProductFormErrors;
  status: ProductFormStatus;
  globalError: string | null;
  isEditing: boolean;
  existingImageUrls: string[];
  newFiles: File[];
  imageLocalError: string | null;
  onSubmit: (e: SyntheticEvent<HTMLFormElement>) => void;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onAddFile: (file: File) => void;
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (index: number) => void;
  onLocalError: (msg: string | null) => void;
};

export function ProductForm({
  fields,
  errors,
  status,
  globalError,
  isEditing,
  existingImageUrls,
  newFiles,
  imageLocalError,
  onSubmit,
  onChange,
  onBlur,
  onAddFile,
  onRemoveExisting,
  onRemoveNew,
  onLocalError,
}: ProductFormProps) {
  const navigate = useNavigate();
  const submitting = status === "submitting";

  const uploadingLabel =
    newFiles.length === 1
      ? "Subiendo imagen..."
      : `Subiendo ${newFiles.length} fotos...`;

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <Field label="Imágenes" htmlFor="image" error={errors.image}>
        <MultiImageUploader
          existingUrls={existingImageUrls}
          newFiles={newFiles}
          onAdd={onAddFile}
          onRemoveExisting={onRemoveExisting}
          onRemoveNew={onRemoveNew}
          disabled={submitting}
          error={errors.image}
          localError={imageLocalError}
          onLocalError={onLocalError}
        />
      </Field>

      <Field label="Nombre" htmlFor="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          value={fields.name}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass}
          placeholder="Mate Imperial"
          disabled={submitting}
        />
      </Field>

      <Field label="Descripción" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          name="description"
          value={fields.description}
          onChange={onChange}
          onBlur={onBlur}
          rows={4}
          className={inputClass}
          placeholder="Detalles del producto..."
          disabled={submitting}
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Categoría" htmlFor="category" error={errors.category}>
          <input
            id="category"
            name="category"
            type="text"
            list="category-suggestions"
            value={fields.category}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClass}
            placeholder="mates"
            disabled={submitting}
          />
          <datalist id="category-suggestions">
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <Field label="Precio (ARS)" htmlFor="price" error={errors.price}>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            value={fields.price}
            onChange={onChange}
            onBlur={onBlur}
            className={inputClass}
            disabled={submitting}
          />
        </Field>
      </div>

      <Field label="Stock" htmlFor="stock" error={errors.stock}>
        <input
          id="stock"
          name="stock"
          type="number"
          min={0}
          value={fields.stock}
          onChange={onChange}
          onBlur={onBlur}
          className={inputClass}
          disabled={submitting}
        />
      </Field>

      {status === "success" && (
        <p className="text-sm text-green-600 font-medium" role="status">
          Producto guardado con éxito. Redirigiendo...
        </p>
      )}

      {globalError && (
        <p className="text-sm text-terracota-500" role="alert">
          {globalError}
        </p>
      )}

      <div className="flex gap-3 pt-2 border-t border-sepia-300">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? newFiles.length > 0
              ? uploadingLabel
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
  );
}
