import { Link } from "react-router-dom";
import { motion } from "motion/react";

interface MenuGroup {
  id: string;
  label: string;
  allLabel: string;
}

const GROUPS: MenuGroup[] = [
  { id: "mates",     label: "Mates",     allLabel: "Todos los mates"     },
  { id: "materas",   label: "Materas",   allLabel: "Todas las materas"   },
  { id: "termos",    label: "Termos",    allLabel: "Todos los termos"    },
  { id: "sombreros", label: "Sombreros", allLabel: "Todos los sombreros" },
  { id: "boinas",    label: "Boinas",    allLabel: "Todas las boinas"    },
  { id: "ponchos",   label: "Ponchos",   allLabel: "Todos los ponchos"   },
];

function assignGroup(category: string): string | null {
  const l = category.toLowerCase();
  if (l.includes("matera"))    return "materas";
  if (l.includes("mate"))      return "mates";
  if (l.includes("termo"))     return "termos";
  if (l.includes("sombrero"))  return "sombreros";
  if (l.includes("boina"))     return "boinas";
  if (l.includes("poncho"))    return "ponchos";
  return null;
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface ProductsMegaMenuProps {
  categories: string[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onLinkClick: () => void;
}

export function ProductsMegaMenu({
  categories,
  onMouseEnter,
  onMouseLeave,
  onLinkClick,
}: ProductsMegaMenuProps) {
  const grouped = new Map<string, string[]>();
  const ungrouped: string[] = [];

  for (const cat of categories) {
    const g = assignGroup(cat);
    if (g) {
      if (!grouped.has(g)) grouped.set(g, []);
      grouped.get(g)!.push(cat);
    } else {
      ungrouped.push(cat);
    }
  }

  const visible = GROUPS.filter((g) => grouped.has(g.id));

  if (visible.length === 0 && ungrouped.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.17, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-0 right-0 top-full z-50 bg-cream-50/98 backdrop-blur border-b border-sepia-300 shadow-warm"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-10 flex-wrap">
        {visible.map((group) => {
          const items = grouped.get(group.id) ?? [];
          return (
            <div key={group.id} className="min-w-[130px]">
              {/* Group label */}
              <p className="text-xs font-bold uppercase tracking-widest text-leather-400 mb-3">
                {group.label}
              </p>

              {/* Divider */}
              <div className="h-px bg-sepia-300 mb-3" />

              {/* All link */}
              <Link
                to="/catalog"
                onClick={onLinkClick}
                className="block text-sm font-semibold text-leather-900 py-1 hover:text-sun-600 transition-colors"
              >
                {group.allLabel}
              </Link>

              {/* Category items */}
              {items.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {items.map((cat) => (
                    <li key={cat}>
                      <Link
                        to={`/catalog?category=${encodeURIComponent(cat)}`}
                        onClick={onLinkClick}
                        className="block text-sm text-leather-600 py-1 hover:text-leather-900 transition-colors"
                      >
                        {capitalize(cat)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {ungrouped.length > 0 && (
          <div className="min-w-[130px]">
            <p className="text-xs font-bold uppercase tracking-widest text-leather-400 mb-3">
              Otros
            </p>
            <div className="h-px bg-sepia-300 mb-3" />
            <ul className="space-y-0.5">
              {ungrouped.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/catalog?category=${encodeURIComponent(cat)}`}
                    onClick={onLinkClick}
                    className="block text-sm text-leather-600 py-1 hover:text-leather-900 transition-colors"
                  >
                    {capitalize(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
