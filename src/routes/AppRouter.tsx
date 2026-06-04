import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  HomePage,
  LoginPage,
  RegisterPage,
  CatalogPage,
  ProductDetailPage,
  ProfilePage,
  CartPage,
  CheckoutPage,
  OrdersPage,
  OrderDetailPage,
  NotFoundPage,
  AdminPage,
  AdminProductsPage,
  AdminProductFormPage,
  AdminOrdersPage,
  AdminOrderDetailPage,
} from "@/pages";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./admin/AdminRoute";
import { Navbar, Footer, AdminLayout, CartDrawer } from "@/components";
import { ProductsProvider, CatalogProvider, CartProvider } from "@/context";
import { AuthLayout } from "@/components/forms/AuthLayout";

const AUTH_PATHS = ["/login", "/register"];

function AnimatedRoutes() {
  const location = useLocation();
  const isAuth = AUTH_PATHS.includes(location.pathname);

  // Rutas de auth comparten la misma key → el motion.div no se desmonta
  // al navegar entre /login y /register, así AuthLayout permanece montado
  // y el panel puede deslizarse reactivamente entre sus posiciones.
  const animKey = isAuth ? "auth" : location.pathname;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={animKey}
        initial={{ opacity: 0, y: isAuth ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: isAuth ? 0 : -6 }}
        transition={{ duration: isAuth ? 0.2 : 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />

          {/* Auth: comparten AuthLayout — el panel desliza al cambiar de ruta */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route
            path="/catalog"
            element={
              <CatalogProvider>
                <CatalogPage />
              </CatalogProvider>
            }
          />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* Protegidas: requieren usuario logueado */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Admin: requieren role === 'admin' */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route
                path="/admin/products/new"
                element={<AdminProductFormPage />}
              />
              <Route
                path="/admin/products/:id/edit"
                element={<AdminProductFormPage />}
              />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route
                path="/admin/orders/:id"
                element={<AdminOrderDetailPage />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ProductsProvider>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <AnimatedRoutes />
          <Footer />
        </CartProvider>
      </ProductsProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
