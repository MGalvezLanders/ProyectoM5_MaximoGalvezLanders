import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/button/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useProductsAdmin } from "@/hooks/admin/useProductsAdmin";
import { getAllOrders } from "@/services/order/orders.service";
import {
  RevenueChart,
  OrdersByStatusChart,
  ProductsByCategoryChart,
  type RevenuePoint,
  type StatusPoint,
  type CategoryPoint,
} from "@/components/admin/AdminCharts";
import type { Order } from "@/types/order";

export default function AdminPage() {
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useProductsAdmin();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAllOrders()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled)
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

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  // ── Chart data ─────────────────────────────────────────────────────────────
  const revenueData = useMemo<RevenuePoint[]>(() => {
    const now = Date.now();
    const msPerDay = 86_400_000;
    const map = new Map<string, number>();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * msPerDay);
      map.set(fmtDate(d), 0);
    }

    const cutoff = new Date(now - 29 * msPerDay);
    cutoff.setHours(0, 0, 0, 0);

    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        const d = o.orderDate.toDate();
        if (d >= cutoff) {
          const key = fmtDate(d);
          map.set(key, (map.get(key) ?? 0) + o.totalPrice);
        }
      });

    return Array.from(map.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));
  }, [orders]);

  const statusData = useMemo<StatusPoint[]>(() => {
    const counts: Record<string, number> = {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({ status, count }));
  }, [orders]);

  const categoryData = useMemo<CategoryPoint[]>(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const loading = productsLoading || ordersLoading;
  const error = productsError ?? ordersError;

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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Productos" value={totalProducts} />
        <StatCard
          label="Sin stock"
          value={outOfStock}
          tone={outOfStock > 0 ? "warn" : "neutral"}
        />
        <StatCard label="Órdenes totales" value={totalOrders} />
        <StatCard
          label="Órdenes pendientes"
          value={pendingOrders}
          tone={pendingOrders > 0 ? "warn" : "neutral"}
        />
      </div>

      {/* Quick actions */}
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

      {/* Charts */}
      <div className="border-t border-sepia-300 pt-8 space-y-6">
        <h3 className="font-display text-lg font-bold text-leather-900">
          Estadísticas
        </h3>

        <RevenueChart data={revenueData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <OrdersByStatusChart data={statusData} />
          <ProductsByCategoryChart data={categoryData} />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(d: Date): string {
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
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
