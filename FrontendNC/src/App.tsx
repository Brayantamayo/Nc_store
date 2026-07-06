/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useProductStore } from './features/store/pages/productStore';
import { Navbar } from './features/home/components/Navbar';
import { Footer } from './features/home/components/Footer';
import { Home } from './features/home/pages/Home';
import { Collection } from './features/store/Components/Listadoproductos';
import { ProductDetail } from './features/store/Components/ProductDetail';
import { Cart, CheckoutPage } from './features/store/Components/Vsitapago';
import { Wishlist } from './features/store/Components/Favoritos';
import { CartDrawer } from './features/store/Components/CartVista';
import { FlyToCart } from './features/store/Components/FlyToCart';
import { Login } from './features/Login/pages/Login';
import { RecoverPasswordPage } from './features/Login/pages/RecoverPasswordPage';
import { ResetPasswordPage } from './features/Login/pages/ResetPasswordPage';
import { CreatePasswordPage } from './features/Login/pages/CreatePasswordPage';
import { AdminPage } from './features/panel/pages/AdminPage';
import { AdminGuard } from './features/panel/components/AdminGuard';
import { AdminLoginModal } from './features/panel/components/AdminLoginModal';
import { SearchModal } from './features/home/components/SearchModal';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.toLowerCase().startsWith('/admin');
  const loadProducts = useProductStore((s) => s.loadProducts);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const routes = (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/coleccion" element={<Collection />} />
        <Route path="/producto/:slug" element={<ProductDetail />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/finalizar-compra" element={<CheckoutPage />} />
        <Route path="/favoritos" element={<Wishlist />} />
        <Route path="/mi-cuenta" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<RecoverPasswordPage />} />
        <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
        <Route path="/crear-password" element={<CreatePasswordPage />} />
        {/* /admin y /admin/* redirigen a landing si no hay sesión (AdminGuard lo maneja) */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route
          path="/sobre-nosotros"
          element={
            <div className="container section">
              <h1>Sobre NC Store</h1>
              <p>Próximamente...</p>
            </div>
          }
        />
        {/* Cualquier ruta no encontrada → landing — DEBE ir al final */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );

  if (isAdminRoute) {
    return (
      <>
        <Toaster richColors closeButton expand position="top-right" toastOptions={{ duration: 3200 }} />
        {routes}
      </>
    );
  }

  return (
    <div className="app-container">
      <Toaster richColors closeButton expand position="top-right" toastOptions={{ duration: 3200 }} />
      <Navbar />
      <CartDrawer />
      <FlyToCart />
      <SearchModal />
      {/* Modal de login admin oculto — se activa con Ctrl+Shift+A */}
      <AdminLoginModal />
      <main>{routes}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}
