import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/types/product";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);

export default function AdminProductsPage() {
  const { products, loading, error, refetch, removeOne } = useProducts();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (product: Product) => {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeletingId(product.id);
    try {
      await removeOne(product.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error eliminando");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Productos</h2>
          <p className="text-sm text-leather-600">
            {products.length} producto{products.length === 1 ? "" : "s"} en el
            catálogo
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
                <th className="text-left px-6 py-3 font-medium">Producto</th>
                <th className="text-left px-3 py-3 font-medium">Categoría</th>
                <th className="text-right px-3 py-3 font-medium">Precio</th>
                <th className="text-right px-3 py-3 font-medium">Stock</th>
                <th className="text-right px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sepia-300/60">
              {products.map((p) => (
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
