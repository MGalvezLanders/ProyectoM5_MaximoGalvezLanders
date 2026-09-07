import type { Product } from "@/types/product";
import type { Order } from "@/types/order";
import { formatOrderDateNumeric, formatPrice } from "@/utils/formatting";

/** Normaliza para comparar: lowercase + trim. */
const norm = (s: string | undefined | null): string =>
  (s ?? "").toString().toLowerCase().trim();

/** Quita tildes/diacríticos: "termó" → "termo", "café" → "cafe". */
const DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");
const stripAccents = (s: string): string =>
  s.normalize("NFD").replace(DIACRITICS_RE, "");

/**
 * Stem básico para español: quita la "s" final de palabras de 4+ letras
 * para igualar plurales sencillos ("mates" → "mate", "ponchos" → "poncho").
 * Conservador para no romper palabras cortas (ej. "gas" no se reduce a "ga").
 */
const stemWord = (w: string): string =>
  w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w;

/** Tokeniza un texto a palabras stemmeadas y sin acentos. */
const stemmedTokens = (s: string): string[] =>
  stripAccents(norm(s))
    .split(/\s+/)
    .filter(Boolean)
    .map(stemWord);

/**
 * Matcher tolerante para la búsqueda del catálogo público.
 * - Insensible a mayúsculas, tildes y plurales sencillos.
 * - Cada palabra del query debe estar (como substring) en algún campo del
 *   producto (nombre, categoría, descripción). Match por palabras, no por
 *   prefijo continuo, así "mate calabaza" encuentra "Mate de calabaza".
 */
export const matchProductFuzzy = (product: Product, query: string): boolean => {
  const needles = stemmedTokens(query);
  if (needles.length === 0) return true;
  const haystack = stemmedTokens(
    `${product.name} ${product.category} ${product.description ?? ""}`,
  ).join(" ");
  return needles.every((n) => haystack.includes(n));
};

/** ¿`text` incluye `query`? Case-insensitive y resistente a `null`. */
const includesCI = (text: string | undefined | null, query: string): boolean =>
  norm(text).includes(query);

//* Formatters compartidos con la UI — el filtro matchea contra el mismo
//* string que ve el usuario en la tabla.
const formatPriceForMatch = (price: number): string => formatPrice(price);
const formatDateForMatch = (date: unknown): string => {
  const formatted = formatOrderDateNumeric(date);
  return formatted === "—" ? "" : formatted;
};

//* ─── Productos ─────────────────────────────────────────────────────────
export const matchProductName = (product: Product, query: string): boolean =>
  !query || includesCI(product.name, norm(query));

export const matchProductCategory = (
  product: Product,
  category: string | null,
): boolean => !category || product.category === category;

export const matchProductPrice = (product: Product, query: string): boolean => {
  if (!query) return true;
  const q = norm(query);
  return (
    formatPriceForMatch(product.price).toLowerCase().includes(q) ||
    String(product.price).includes(q)
  );
};

export const matchProductStock = (product: Product, query: string): boolean => {
  if (!query) return true;
  const q = norm(query);
  return String(product.stock).includes(q);
};

//* ─── Órdenes ───────────────────────────────────────────────────────────
export const matchOrderId = (order: Order, query: string): boolean =>
  !query || includesCI(order.id, norm(query));

export const matchOrderDate = (order: Order, query: string): boolean => {
  if (!query) return true;
  return formatDateForMatch(order.orderDate)
    .toLowerCase()
    .includes(norm(query));
};

export const matchOrderUser = (order: Order, query: string): boolean => {
  if (!query) return true;
  const q = norm(query);
  return (
    includesCI(order.userId, q) || includesCI(order.shippingInfo?.name, q)
  );
};

export const matchOrderTotal = (order: Order, query: string): boolean => {
  if (!query) return true;
  const q = norm(query);
  return (
    formatPriceForMatch(order.totalPrice).toLowerCase().includes(q) ||
    String(order.totalPrice).includes(q)
  );
};

export const matchOrderStatus = (
  order: Order,
  status: string | null,
): boolean => !status || order.status === status;

export const assignGroup = (cat: string): string | null => {
  const l = cat.toLowerCase();
  if (l.includes("matera"))   return "materas";
  if (l.includes("mate"))     return "mates";
  if (l.includes("termo"))    return "termos";
  if (l.includes("bombilla")) return "bombillas";
  if (l.includes("sombrero")) return "sombreros";
  if (l.includes("boina"))    return "boinas";
  if (l.includes("poncho"))   return "ponchos";
  if (
    l.includes("accesorio") || l.includes("cinturón") ||
    l.includes("rastra") || l.includes("espuela") ||
    l.includes("facón") || l.includes("botas")
  ) return "accesorios";
  return null;
};
