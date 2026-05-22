import { Spinner } from "@/components/ui/Spinner";
import { ProductForm } from "@/components/admin/ProductForm";
import { useProductForm } from "@/hooks/admin/useProductForm";

export default function AdminProductFormPage() {
  const {
    state,
    loading,
    selectedFile,
    isEditing,
    visibleErrors,
    handleChange,
    handleBlur,
    handleFileSelected,
    handleSubmit,
  } = useProductForm();

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
          Completá los datos. La imagen se sube a S3 al guardar.
        </p>
      </header>

      <ProductForm
        fields={state.fields}
        errors={visibleErrors}
        status={state.status}
        globalError={state.globalError}
        selectedFile={selectedFile}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onBlur={handleBlur}
        onFileSelected={handleFileSelected}
      />
    </div>
  );
}
