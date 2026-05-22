import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/forms/LoginPage";
import RegisterPage from "@/pages/forms/RegisterPage";
import CatalogPage from "@/pages/catalog/CatalogPage";
import ProductDetailPage from "@/pages/products/ProductDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import CartPage from "@/pages/cart/CartPage";
import CheckoutPage from "@/pages/cart/CheckoutPage";
import OrdersPage from "@/pages/orders/OrdersPage";
import OrderDetailPage from "@/pages/orders/OrderDetailPage";
import NotFoundPage from "@/pages/NotFoundPage";
import AdminPage from "@/pages/admin/AdminPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminProductFormPage from "@/pages/admin/AdminProductFormPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "@/pages/admin/AdminOrderDetailPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { Navbar } from "@/components/Navbar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductsProvider } from "@/context/ProductsContext";
import { CatalogProvider } from "@/context/CatalogContext";
import { CartProvider } from "@/context/cart/CartContext";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <ProductsProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            {/* Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
        </CartProvider>
      </ProductsProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
