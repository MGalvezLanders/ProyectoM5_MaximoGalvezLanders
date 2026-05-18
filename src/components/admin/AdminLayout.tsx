import { NavLink, Outlet } from "react-router-dom";
import { Container } from "@/components/ui/Container";

const SECTIONS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Productos" },
  { to: "/admin/orders", label: "Órdenes" },
];

export function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
      isActive
        ? "bg-leather-600 text-cream-50"
        : "text-leather-700 hover:bg-cream-100",
    ].join(" ");

  return (
    <div className="min-h-[calc(100vh-65px)] bg-cream-100/40">
      <Container size="xl" className="py-8">
        <div className="mb-6 pb-4 border-b border-sepia-300">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-leather-500 mb-1">
            Panel de administración
          </span>
          <h1 className="font-display text-3xl font-bold">La Gauchada · Admin</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <aside className="bg-cream-50 border border-sepia-300 rounded-xl p-3 h-fit lg:sticky lg:top-24">
            <nav>
              <ul className="space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.to}>
                    <NavLink to={s.to} end={s.end} className={linkClass}>
                      {s.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <main className="bg-cream-50 border border-sepia-300 rounded-xl p-6 min-h-[400px]">
            <Outlet />
          </main>
        </div>
      </Container>
    </div>
  );
}
