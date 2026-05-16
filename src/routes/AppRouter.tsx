import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import CatalogPage from '@/pages/CatalogPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import ProfilePage from '@/pages/ProfilePage'
import CartPage from '@/pages/CartPage'
import OrdersPage from '@/pages/OrdersPage'
import NotFoundPage from '@/pages/NotFoundPage'
import AdminPage from '@/pages/AdminPage'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protegidas: requieren usuario logueado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>

        {/* Admin: requieren role === 'admin' */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
