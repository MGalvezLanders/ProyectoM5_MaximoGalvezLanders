import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";

interface SidebarGroup {
  id: string;
  label: string;
  items: string[];
}

const GROUPS: SidebarGroup[] = [
  {
    id: "mates",
    label: "Mates",
    items: [
      "mate imperial",
      "mate torpedo",
      "mate criollo",
      "mate con pico",
      "mate de calabaza",
      "mate artesanal",
      "mate de madera",
      "mate de cuerno",
    ],
  },
  {
    id: "materas",
    label: "Materas",
    items: [
      "matera de cuero",
      "matera de tela",
      "matera tejida",
      "matera gaucha",
      "matera de cuero trenzado",
    ],
  },
  {
    id: "termos",
    label: "Termos",
    items: [
      "termo de acero",
      "termo de vidrio",
      "termo gaucho",
      "termo con funda",
      "termo largo",
    ],
  },
  {
    id: "bombillas",
    label: "Bombillas",
    items: [
      "bombilla de alpaca",
      "bombilla de acero",
      "bombilla de caña",
      "bombilla artesanal",
      "bombilla coladera",
    ],
  },
  {
    id: "sombreros",
    label: "Sombreros",
    items: [
      "sombrero gaucho",
      "sombrero pampa",
      "sombrero de paja",
      "sombrero de fieltro",
      "sombrero norteño",
    ],
  },
  {
    id: "boinas",
    label: "Boinas",
    items: [
      "boina clásica",
      "boina vasca",
      "boina de lana",
      "boina marinera",
      "boina gaucha",
    ],
  },
  {
    id: "ponchos",
    label: "Ponchos",
    items: [
      "poncho de lana",
      "poncho de alpaca",
      "poncho criollo",
      "poncho norteño",
      "poncho pampeano",
    ],
  },
  {
    id: "accesorios",
    label: "Accesorios",
    items: [
      "cinturón gaucho",
      "rastra",
      "espuelas",
      "facón",
      "botas de potro",
    ],
  },
];

function assignGroup(cat: string): string | null {
  const l = cat.toLowerCase();
  if (l.includes("matera"))    return "materas";
  if (l.includes("mate"))      return "mates";
  if (l.includes("termo"))     return "termos";
  if (l.includes("bombilla"))  return "bombillas";
  if (l.includes("sombrero"))  return "sombreros";
  if (l.includes("boina"))     return "boinas";
  if (l.includes("poncho"))    return "ponchos";
  return null;
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface CatalogSidebarProps {
  category: string | undefined;
  onSelect: (cat: string | undefined) => void;
  firestoreCategories: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function CatalogSidebar({
  category,
  onSelect,
  firestoreCategories,
  isOpen,
  onClose,
}: CatalogSidebarProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Categorías de Firestore que no están en los items hardcodeados
  const allHardcoded = new Set(GROUPS.flatMap((g) => g.items));
  const ungrouped = firestoreCategories.filter(
    (cat) => !allHardcoded.has(cat.toLowerCase()) && !assignGroup(cat)
  );

  const handleSelect = (val: string | undefined) => {
    onSelect(val);
    onClose();
  };

  const itemClass = (val: string | undefined) =>
    [
      "w-full text-left px-3 py-1.5 rounded-lg text-sm capitalize transition-colors",
      category === val
        ? "bg-leather-600 text-cream-50 font-medium"
        : "text-leather-700 hover:bg-cream-100",
    ].join(" ");

  const content = (
    <nav className="px-3 py-4 space-y-5">
      <button onClick={() => handleSelect(undefined)} className={[itemClass(undefined), "font-semibold"].join(" ")}>
        Todos los productos
      </button>

      {GROUPS.map((group) => (
        <div key={group.id}>
          <p className="text-xs font-bold uppercase tracking-widest text-leather-400 mb-1.5 px-3">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item}>
                <button onClick={() => handleSelect(item)} className={itemClass(item)}>
                  {cap(item)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {ungrouped.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-leather-400 mb-1.5 px-3">
            Otros
          </p>
          <ul className="space-y-0.5">
            {ungrouped.map((cat) => (
              <li key={cat}>
                <button onClick={() => handleSelect(cat)} className={itemClass(cat)}>
                  {cap(cat)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* Desktop: sidebar fijo */}
      <aside className="hidden md:flex flex-col w-52 shrink-0 sticky top-20 self-start max-h-[calc(100vh-5.5rem)] border border-sepia-300 rounded-xl bg-cream-50 overflow-y-auto">
        {content}
      </aside>

      {/* Mobile: drawer desde la izquierda */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-leather-900/40 z-40 md:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 w-72 bg-cream-50 border-r border-sepia-300 z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-sepia-300 shrink-0">
                <span className="font-display font-semibold text-leather-900">Filtros</span>
                <button
                  onClick={onClose}
                  aria-label="Cerrar filtros"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-leather-700 hover:bg-cream-100 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{content}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
