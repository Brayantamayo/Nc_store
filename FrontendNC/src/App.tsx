/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { Navbar } from './features/home/components/Navbar';
import { Footer } from './features/home/components/Footer';
import { Home } from './features/home/pages/Home';
import { Collection } from './features/store/Components/Listadoproductos';
import { ProductDetail } from './features/store/Components/ProductDetail';
import { Cart, CheckoutPage } from './features/store/Components/Vsitapago';
import { Wishlist } from './features/store/Components/Favoritos';
import { CartDrawer } from './features/store/Components/CartVista';
import { FlyToCart } from './features/store/Components/FlyToCart';
import { CartSuccessToast } from './features/store/Components/CartSuccessToast';
import { Login } from './features/Login/pages/Login';
import { SearchModal } from './features/home/components/SearchModal';
import { AdminPage } from './features/panel/pages/AdminPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="app-container">
      {!isAdmin && <Navbar />}
      <CartDrawer />
      <FlyToCart />
      <CartSuccessToast />
      <SearchModal />
      <main style={isAdmin ? { paddingTop: 0, minHeight: '100vh' } : {}}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coleccion" element={<Collection />} />
            <Route path="/producto/:slug" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/finalizar-compra" element={<CheckoutPage />} />
            <Route path="/favoritos" element={<Wishlist />} />
            <Route path="/mi-cuenta" element={<Login />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/sobre-nosotros" element={<div className="container section"><h1>Sobre NC Store</h1><p>Próximamente...</p></div>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!isAdmin && <Footer />}
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
