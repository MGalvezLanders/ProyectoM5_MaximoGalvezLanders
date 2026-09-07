import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatPrice } from "@/utils/formatting";

// ─── Palette ────────────────────────────────────────────────────────────────
const COLORS = {
  leather: "#8B6840",
  terracota: "#C8603A",
  field: "#5A8F6A",
  sun: "#D4A843",
  sky: "#4A87C0",
  sepia: "#B89878",
};

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.sun,
  processing: COLORS.sky,
  completed: COLORS.field,
  cancelled: COLORS.terracota,
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  processing: "En proceso",
  completed: "Completada",
  cancelled: "Cancelada",
};

// ─── Shared tooltip styles ───────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "#FAF7F0",
  border: "1px solid #D4C4B0",
  borderRadius: "10px",
  fontSize: "13px",
  color: "#3D2B0F",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

// ─── Types ───────────────────────────────────────────────────────────────────
export type RevenuePoint = { date: string; revenue: number };
export type StatusPoint = { status: string; count: number };
export type CategoryPoint = { category: string; count: number };
export type TopProductPoint = { name: string; qty: number };
export type WeekdayPoint = { day: string; count: number };

// ─── Revenue chart ───────────────────────────────────────────────────────────
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const hasData = data.some((d) => d.revenue > 0);

  return (
    <ChartCard title="Ingresos — últimos 30 días">
      {!hasData ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.leather} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS.leather} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#D4C4B0" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#8B6840" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8B6840" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [formatPrice(typeof value === "number" ? value : 0), "Ingresos"]}
              labelStyle={{ color: "#7C5C30", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={COLORS.leather}
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: COLORS.leather }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ─── Orders by status (donut) ────────────────────────────────────────────────
export function OrdersByStatusChart({ data }: { data: StatusPoint[] }) {
  const hasData = data.some((d) => d.count > 0);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <ChartCard title="Órdenes por estado">
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? COLORS.sepia}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  const v = typeof value === "number" ? value : 0;
                  const statusKey = String(name);
                  return [
                    `${v} (${Math.round((v / total) * 100)}%)`,
                    STATUS_LABELS[statusKey] ?? statusKey,
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
            {data.map((d) => (
              <span key={d.status} className="flex items-center gap-1.5 text-xs text-leather-700">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[d.status] ?? COLORS.sepia }}
                />
                {STATUS_LABELS[d.status] ?? d.status}{" "}
                <span className="font-semibold text-leather-900">{d.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

// ─── Products by category (bar) ──────────────────────────────────────────────
export function ProductsByCategoryChart({ data }: { data: CategoryPoint[] }) {
  const hasData = data.length > 0;

  return (
    <ChartCard title="Productos por categoría">
      {!hasData ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#D4C4B0" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#8B6840" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={{ fontSize: 12, fill: "#3D2B0F" }}
              tickLine={false}
              axisLine={false}
              width={90}
              tickFormatter={(v: string) =>
                v.length > 14 ? v.slice(0, 13) + "…" : v
              }
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [typeof value === "number" ? value : 0, "Productos"]}
              cursor={{ fill: "#D4C4B040" }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    [
                      COLORS.leather,
                      COLORS.terracota,
                      COLORS.field,
                      COLORS.sun,
                      COLORS.sky,
                      COLORS.sepia,
                    ][i % 6]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ─── Top productos vendidos (bar horizontal) ─────────────────────────────────
export function TopProductsChart({ data }: { data: TopProductPoint[] }) {
  const hasData = data.length > 0;

  return (
    <ChartCard title="Top productos más vendidos">
      {!hasData ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#D4C4B0" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#8B6840" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#3D2B0F" }}
              tickLine={false}
              axisLine={false}
              width={110}
              tickFormatter={(v: string) => (v.length > 15 ? v.slice(0, 14) + "…" : v)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [typeof value === "number" ? value : 0, "Unidades vendidas"]}
              cursor={{ fill: "#D4C4B040" }}
            />
            <Bar dataKey="qty" fill={COLORS.terracota} radius={[0, 6, 6, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ─── Órdenes por día de semana (bar vertical) ────────────────────────────────
export function OrdersByWeekdayChart({ data }: { data: WeekdayPoint[] }) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <ChartCard title="Órdenes por día de semana">
      {!hasData ? (
        <EmptyState />
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#D4C4B0" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: "#3D2B0F" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#8B6840" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [typeof value === "number" ? value : 0, "Órdenes"]}
              cursor={{ fill: "#D4C4B040" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    [
                      COLORS.leather,
                      COLORS.sky,
                      COLORS.field,
                      COLORS.terracota,
                      COLORS.sun,
                      COLORS.sky,
                      COLORS.sepia,
                    ][i % 7]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

// ─── Shared shell ────────────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-cream-100 border border-sepia-300 rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-leather-500 mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-leather-400">
      Sin datos suficientes
    </div>
  );
}
