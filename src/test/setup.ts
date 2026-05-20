import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// La limpieza del DOM entre tests la hace Testing Library automáticamente
// (globals: true), y el reseteo de mocks lo maneja `clearMocks` en
// vitest.config.ts. Acá solo registramos los module mocks.

// Firebase: nunca inicializamos el SDK real en tests. Reemplazamos el módulo
// que exporta `auth` y `db` por stubs vacíos.
vi.mock("@/services/firebase", () => ({
  auth: {},
  db: {},
}));

// Auth: por defecto el usuario está deslogueado. `onAuthChange` invoca el
// callback con `null` y devuelve un unsubscribe no-op. Los tests que necesiten
// un usuario logueado pueden re-mockear este módulo con vi.mock/vi.mocked.
vi.mock("@/services/auth", () => ({
  onAuthChange: (cb: (user: unknown) => void) => {
    cb(null);
    return () => {};
  },
  login: vi.fn(),
  register: vi.fn(),
  loginWithGoogle: vi.fn(),
  logout: vi.fn(),
}));

// AWS SDK: solo se usa server-side (Vercel Functions en /api). El cliente sube
// vía fetch a una presigned URL. Mockeamos defensivamente por si algún test
// importa estos paquetes de forma transitiva.
vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: vi.fn(),
  PutObjectCommand: vi.fn(),
  DeleteObjectCommand: vi.fn(),
}));
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://signed.example/upload"),
}));

// Productos: evita cualquier llamada a Firestore durante tests de UI.
vi.mock("@/services/products", () => ({
  getProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue(null),
  getCategories: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn().mockResolvedValue("mock-product-id"),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
}));

// Firestore users: funciones llamadas sólo cuando hay usuario logueado.
vi.mock("@/services/users", () => ({
  getUserProfile: vi.fn().mockResolvedValue(null),
  createUserProfile: vi.fn().mockResolvedValue(undefined),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
}));

// Carrito: por defecto vacío. Tests individuales pueden re-mockear con vi.mocked().
vi.mock("@/services/cart", () => ({
  getCart: vi.fn().mockResolvedValue([]),
  saveCart: vi.fn().mockResolvedValue(undefined),
}));

// Órdenes: devuelve un id ficticio para no conectar a Firestore.
vi.mock("@/services/orders", () => ({
  createOrder: vi.fn().mockResolvedValue("mock-order-id"),
  getAllOrders: vi.fn().mockResolvedValue([]),
  getUserOrders: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
}));
