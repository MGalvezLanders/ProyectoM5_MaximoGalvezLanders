import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

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

/** Formato ARS sin centavos, igual al usado en la UI. */
const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const formatPriceForMatch = (price: number): string =>
  priceFormatter.format(price);

/**
 * Convierte un Firestore Timestamp / Date / string a "DD/MM/YYYY" en es-AR
 * para que el filtro de texto sobre fecha funcione como en la grilla.
 */
const formatDateForMatch = (date: unknown): string => {
  if (date instanceof Date) return date.toLocaleDateString("es-AR");
  if (
    date &&
    typeof date === "object" &&
    "toDate" in date &&
    typeof (date as { toDate: () => Date }).toDate === "function"
  ) {
    return (date as { toDate: () => Date }).toDate().toLocaleDateString("es-AR");
  }
  return "";
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
