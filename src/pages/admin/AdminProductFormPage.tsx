import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useProducts } from "@/hooks/useProducts";
import { getProductById, type ProductInput } from "@/services/products";

const EMPTY: ProductInput = {
  name: "",
  description: "",
  price: 0,
  category: "",
  imageUrl: "",
  stock: 0,
};

const CATEGORIES_HINT = [
  "mates",
  "termos",
  "materas",
  "ponchos",
  "sombreros",
  "boinas",
];

export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { createOne, updateOne } = useProducts();

  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getProductById(id)
      .then((product) => {
        if (cancelled) return;
        if (!product) {
          setError("Producto no encontrado");
          return;
        }
        setForm({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          imageUrl: product.imageUrl,
          stock: product.stock,
        });
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error cargando");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const updateField = <K extends keyof ProductInput>(
    field: K,
    value: ProductInput[K],
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.description.trim() || !form.category.trim()) {
      setError("Nombre, descripción y categoría son obligatorios");
      return;
    }
    if (form.price <= 0) {
      setError("El precio debe ser mayor a 0");
      return;
    }
    if (form.stock < 0) {
      setError("El stock no puede ser negativo");
      return;
    }
    if (!form.imageUrl) {
      setError("Subí una imagen antes de guardar");
      return;
    }

    setSubmitting(true);
    try {
      const payload: ProductInput = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim().toLowerCase(),
      };
      if (isEditing && id) {
        await updateOne(id, payload);
      } else {
        await createOne(payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h2 className="font-display text-2xl font-bold mb-1">
          {isEditing ? "Editar producto" : "Nuevo producto"}
        </h2>
        <p className="text-sm text-leather-600">
          Completá los datos. La imagen se sube a S3 al elegir el archivo.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Imagen" htmlFor="image">
          <ImageUploader
            value={form.imageUrl}
            onChange={(url) => updateField("imageUrl", url)}
            onError={setError}
          />
        </Field>

        <Field label="Nombre" htmlFor="name">
          <input
            id="name"
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
            placeholder="Mate Imperial"
          />
        </Field>

        <Field label="Descripción" htmlFor="description">
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            className={inputClass}
            placeholder="Detalles del producto..."
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Categoría" htmlFor="category">
            <input
              id="category"
              type="text"
              list="category-suggestions"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className={inputClass}
              placeholder="mates"
            />
            <datalist id="category-suggestions">
              {CATEGORIES_HINT.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field label="Precio (ARS)" htmlFor="price">
            <input
              id="price"
              type="number"
              min={0}
              step={100}
              value={form.price}
              onChange={(e) =>
                updateField("price", Number(e.target.value) || 0)
              }
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Stock" htmlFor="stock">
          <input
            id="stock"
            type="number"
            min={0}
            value={form.stock}
            onChange={(e) => updateField("stock", Number(e.target.value) || 0)}
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="text-sm text-terracota-500" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2 border-t border-sepia-300">
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Guardando..."
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
  "w-full px-3.5 py-2.5 rounded-lg bg-cream-50 text-leather-900 border border-sepia-400 focus:outline-none focus:ring-2 focus:ring-sun-500/50 focus:border-sun-500 transition-colors";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
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
    </div>
  );
}
