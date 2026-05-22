import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useProductsAdmin } from "@/hooks/admin/useProductsAdmin";
import { getAllOrders } from "@/services/orders.service";
import { MOCK_PRODUCTS } from "@/utils/mockProducts";
import type { Order } from "@/types/order";

type OrderStats = {
  totalOrders: number;
  pendingOrders: number;
};

export default function AdminPage() {
  const {
    products,
    loading: productsLoading,
    error: productsError,
    bulkCreate,
  } = useProductsAdmin();

  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllOrders()
      .catch(() => [] as Order[])
      .then((orders) => {
        if (cancelled) return;
        setOrderStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "pending").length,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setOrdersError(
          err instanceof Error ? err.message : "Error cargando órdenes",
        );
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSeedMock = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const count = await bulkCreate(MOCK_PRODUCTS);
      setSeedMessage(`✔ Se crearon ${count} productos mock.`);
    } catch (err) {
      setSeedMessage(
        `✖ Error: ${err instanceof Error ? err.message : "no se pudieron crear los productos"}`,
      );
    } finally {
      setIsSeeding(false);
    }
  };

  const loading = productsLoading || ordersLoading;
  const error = productsError ?? ordersError;

  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return <p className="text-terracota-500">{error}</p>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="font-display text-2xl font-bold mb-1">Dashboard</h2>
        <p className="text-sm text-leather-600">
          Resumen del estado actual del e-commerce.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Productos" value={totalProducts} />
        <StatCard
          label="Sin stock"
          value={outOfStock}
          tone={outOfStock > 0 ? "warn" : "neutral"}
        />
        <StatCard
          label="Órdenes totales"
          value={orderStats?.totalOrders ?? 0}
        />
        <StatCard
          label="Órdenes pendientes"
          value={orderStats?.pendingOrders ?? 0}
          tone={orderStats && orderStats.pendingOrders > 0 ? "warn" : "neutral"}
        />
      </div>

      <div className="border-t border-sepia-300 pt-6 flex flex-wrap gap-3">
        <Link to="/admin/products/new">
          <Button>Crear producto</Button>
        </Link>
        <Link to="/admin/products">
          <Button variant="outline">Ver productos</Button>
        </Link>
        <Link to="/admin/orders">
          <Button variant="outline">Ver órdenes</Button>
        </Link>
      </div>

      {import.meta.env.DEV && (
        <div className="border-t border-sepia-300 pt-6">
          <h3 className="font-display text-lg font-bold mb-1">Dev tools</h3>
          <p className="text-sm text-leather-600 mb-3">
            Sube {MOCK_PRODUCTS.length} productos hardcodeados a Firestore con
            imágenes placeholder (no requiere S3). Solo visible en dev.
          </p>
          <Button
            onClick={handleSeedMock}
            disabled={isSeeding}
            variant="outline"
          >
            {isSeeding ? "Subiendo..." : "Subir productos mock"}
          </Button>
          {seedMessage && (
            <p className="mt-2 text-sm text-leather-700">{seedMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warn";
}) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        tone === "warn"
          ? "bg-sun-400/15 border-sun-500"
          : "bg-cream-100 border-sepia-300",
      ].join(" ")}
    >
      <span className="block text-xs uppercase tracking-wider text-leather-500 mb-1">
        {label}
      </span>
      <span className="font-display text-3xl font-bold text-leather-900">
        {value}
      </span>
    </div>
  );
}
