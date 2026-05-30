import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/button/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ColumnHeader } from "@/components/admin/ColumnHeader";
import { TextFilterBody } from "@/components/admin/filters/TextFilterBody";
import { SelectFilterBody } from "@/components/admin/filters/SelectFilterBody";
import { useProductsAdmin } from "@/hooks/admin/useProductsAdmin";
import { useAdminProductFilters } from "@/hooks/admin/useAdminProductFilters";
import { formatPrice } from "@/utils/formatting";
import type { Product } from "@/types/product";

export default function AdminProductsPage() {
  const { products, loading, error, refetch, removeOne } = useProductsAdmin();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    name,
    setName,
    category,
    setCategory,
    price,
    setPrice,
    stock,
    setStock,
    filtered,
    hasActiveFilters,
    clearAll,
  } = useAdminProductFilters(products);

  //* Opciones de categoría derivadas del catálogo cargado.
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set)
      .sort()
      .map((c) => ({ value: c, label: c }));
  }, [products]);

  const handleDelete = (product: Product) => {
    toast.warning(`¿Eliminar "${product.name}"?`, {
      description: "Esta acción no se puede deshacer.",
      duration: 6000,
      action: {
        label: "Eliminar",
        onClick: async () => {
          setDeletingId(product.id);
          try {
            await removeOne(product.id);
            toast.success(`"${product.name}" eliminado correctamente`);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error eliminando");
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Productos</h2>
          <p className="text-sm text-leather-600">
            {products.length} producto{products.length === 1 ? "" : "s"} en el
            catálogo
            {hasActiveFilters && (
              <>
                <span className="text-leather-900 font-medium">
                  {" "}
                  · {filtered.length} coinciden
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="ml-3 text-xs text-leather-600 hover:text-leather-900 underline"
                >
                  Limpiar filtros
                </button>
              </>
            )}
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button>+ Nuevo producto</Button>
        </Link>
      </header>

      {loading && (
        <div className="flex justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-12">
          <p className="text-terracota-500 mb-3">{error}</p>
          <Button variant="outline" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-leather-700 mb-4">
            No hay productos cargados todavía.
          </p>
          <Link to="/admin/products/new">
            <Button>Crear el primero</Button>
          </Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead className="border-y border-sepia-300 bg-cream-100/60 text-leather-600">
              <tr>
                <th className="text-left px-6 py-3">
                  <ColumnHeader
                    label="Producto"
                    filterActive={name.trim().length > 0}
                    onClear={() => setName("")}
                  >
                    <TextFilterBody
                      value={name}
                      onChange={setName}
                      placeholder="Buscar nombre..."
                    />
                  </ColumnHeader>
                </th>
                <th className="text-left px-3 py-3">
                  <ColumnHeader
                    label="Categoría"
                    filterActive={category !== null}
                    onClear={() => setCategory(null)}
                  >
                    <SelectFilterBody<string>
                      value={category}
                      onChange={setCategory}
                      options={categoryOptions}
                      allLabel="Todas"
                      capitalize
                    />
                  </ColumnHeader>
                </th>
                <th className="text-right px-3 py-3">
                  <ColumnHeader
                    label="Precio"
                    align="right"
                    filterActive={price.trim().length > 0}
                    onClear={() => setPrice("")}
                  >
                    <TextFilterBody
                      value={price}
                      onChange={setPrice}
                      placeholder="Ej: 5000"
                    />
                  </ColumnHeader>
                </th>
                <th className="text-right px-3 py-3">
                  <ColumnHeader
                    label="Stock"
                    align="right"
                    filterActive={stock.trim().length > 0}
                    onClear={() => setStock("")}
                  >
                    <TextFilterBody
                      value={stock}
                      onChange={setStock}
                      placeholder="Ej: 10"
                    />
                  </ColumnHeader>
                </th>
                <th className="text-right px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sepia-300/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-leather-700">
                    Ningún producto coincide con los filtros.
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="ml-2 text-leather-900 underline hover:text-sun-600"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-100/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-sepia-300"
                        />
                        <span className="font-medium text-leather-900">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 capitalize text-leather-700">
                      {p.category}
                    </td>
                    <td className="px-3 py-3 text-right text-leather-900 font-medium tabular-nums">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {p.stock === 0 ? (
                        <Badge tone="danger">0</Badge>
                      ) : p.stock <= 3 ? (
                        <Badge tone="sun">{p.stock}</Badge>
                      ) : (
                        <span className="text-leather-900 tabular-nums">
                          {p.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="text-sm font-medium text-leather-700 hover:text-leather-900 mr-3"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="text-sm font-medium text-terracota-500 hover:underline disabled:opacity-50"
                      >
                        {deletingId === p.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
