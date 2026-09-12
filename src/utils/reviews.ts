/**
 * Reviews mock estables por productId. Simula rating y reseñas para demo —
 * cuando exista backend, reemplazar con datos reales manteniendo la interfaz.
 */

export type MockReview = {
  author: string;
  location: string;
  date: string;
  rating: number;
  title: string;
  body: string;
};

const REVIEW_POOL: MockReview[] = [
  {
    author: "Lucía P.",
    location: "Córdoba",
    date: "hace 2 semanas",
    rating: 5,
    title: "Superó mis expectativas",
    body: "La calidad se nota apenas lo abrís. Se ve que hay mucho trabajo detrás y llegó impecable.",
  },
  {
    author: "Sergio B.",
    location: "Mendoza",
    date: "hace 1 mes",
    rating: 5,
    title: "Un lujo",
    body: "Regalo de cumpleaños para mi hermano. Le encantó, dice que es el mejor que tuvo.",
  },
  {
    author: "Malena F.",
    location: "Tucumán",
    date: "hace 3 semanas",
    rating: 4,
    title: "Muy bueno, envío rápido",
    body: "En dos días lo tenía en casa. La pieza cumple lo que promete, aunque le falta un detalle en la costura.",
  },
  {
    author: "Nahuel R.",
    location: "Bariloche, Río Negro",
    date: "hace 1 semana",
    rating: 5,
    title: "Artesanía de verdad",
    body: "Se nota que es hecho a mano y no en serie. La atención fue buenísima, me respondieron todas las dudas.",
  },
  {
    author: "Valentina C.",
    location: "La Plata, Buenos Aires",
    date: "hace 2 meses",
    rating: 5,
    title: "Volvería a comprar",
    body: "Segundo pedido que hago y no me falla. Recomiendo la tienda, hacen las cosas bien.",
  },
  {
    author: "Diego M.",
    location: "Salta",
    date: "hace 5 días",
    rating: 4,
    title: "Muy conforme",
    body: "El producto es exactamente como se ve en la foto. Tardó un día más de lo esperado pero llegó bien.",
  },
];

//* Hash simple determinístico (djb2) — para picks estables por id.
function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

export type ProductRating = {
  average: number;
  count: number;
};

/** Rating estable por productId: promedio entre 4.2 y 5.0, count entre 12 y 450. */
export function getProductRating(productId: string): ProductRating {
  const h = hash(productId);
  const average = 4.2 + ((h % 9) * 0.1); // 4.2 – 5.0
  const count = 12 + (h % 439);          // 12 – 450
  return {
    average: Math.round(average * 10) / 10,
    count,
  };
}

/** Devuelve 3 reviews estables por productId, rotando el pool. */
export function getProductReviews(productId: string): MockReview[] {
  const h = hash(productId);
  const offset = h % REVIEW_POOL.length;
  return [0, 1, 2].map((i) => REVIEW_POOL[(offset + i) % REVIEW_POOL.length]);
}
