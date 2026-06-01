// 1. Librerías
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Search, Menu, X } from 'lucide-react';

// 2. Estado (Zustand)
import { useUIStore } from '../../store/pages/uiStore';
import { useCartStore } from '../../store/pages/cartStore';
import { useFlyToCartStore } from '../../store/pages/flyToCartStore';
import { useWishlistStore } from '../../store/pages/wishlistStore';
import { useCustomerSessionStore } from '../../Login/services/AuthServices';

// 3. Componentes
import { Bow, CoquetteUserIcon } from './Moñito';

// 4. Estilos
import styles from '../css/Navbar.module.css';

interface NavLinkItem {
  name: string;
  path: string;
  subLinks?: { name: string; path: string }[];
}

export const Navbar = () => {
  const { isMobileMenuOpen, setMobileMenuOpen, setSearchOpen } = useUIStore();
  const { toggleCart, itemCount } = useCartStore();
  const cartPulse = useFlyToCartStore((s) => s.cartPulse);
  const { items: wishlistItems } = useWishlistStore();
  const customer = useCustomerSessionStore((state) => state.customer);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const leftLinks: NavLinkItem[] = [
    { name: 'Inicio', path: '/' },
    { name: 'Bolsos', path: '/coleccion?category=bolsos' },
    { name: 'Maquillaje', path: '/coleccion?category=maquillaje' },
    { 
      name: 'Accesorios', 
      path: '/coleccion?category=accesorios',
      subLinks: [
        { name: 'Monedero', path: '/coleccion?category=monedero' },
        { name: 'Cosmetiquera', path: '/coleccion?category=cosmetiquera' },
        { name: 'Accesorios para bolsos', path: '/coleccion?category=accesorios-bolsos' }
      ]
    },
  ];

  const rightLinks: NavLinkItem[] = [
    { name: 'Tote Bag', path: '/coleccion?category=tote' },
    { name: 'Puffer', path: '/coleccion?category=puffer' },
    { name: 'Combos', path: '/coleccion?category=combos' },
    { name: 'Descuentos', path: '/coleccion?category=descuentos' },
  ];

  return (
    <>
      <div className={styles.announcementBar}>
        <div className={styles.announcementContent}>
          <span>ENVÍO GRATUITO EN COMPRAS SUPERIORES A $300.000</span>
          <Bow size={10} color="var(--color-white)" />
          <span>ESTILO COQUETTE CHIC MEDELLÍN</span>
        </div>
      </div>
      <nav className={`${styles.nav} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          {/* Mobile Menu Trigger */}
          <button 
            className={styles.menuBtn} 
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          {/* Nav Links Desktop Left */}
          <div className={styles.desktopLinksLeft}>
            {leftLinks.map((link) => (
              <div key={link.name} className={styles.navLinkWrapper}>
                {link.subLinks ? (
                  <div className={styles.dropdownTrigger}>
                    <Link to={link.path} className={styles.navLink}>
                      {link.name}
                    </Link>
                    <div className={styles.dropdownContent}>
                      {link.subLinks.map((sub) => (
                        <Link key={sub.name} to={sub.path} className={styles.dropdownLink}>
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link to={link.path} className={styles.navLink}>
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Logo */}
          <div className={styles.logoWrapper}>
            <Bow size={20} className={styles.logoBow} color="var(--color-primary)" />
            <Link to="/" className={styles.logo}>
              NC STORE
            </Link>
          </div>

          {/* Nav Links Desktop Right */}
          <div className={styles.desktopLinksRight}>
            <div className={styles.rightLinksContainer}>
              {rightLinks.map((link) => (
                <Link key={link.name} to={link.path} className={styles.navLink}>
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className={styles.navIcons}>
              <Link to="/mi-cuenta" className={styles.iconBtn} aria-label="Mi Cuenta">
                <CoquetteUserIcon size={22} color="var(--color-primary)" />
                {customer && (
                  <span className={styles.sessionDot} title={`Sesion activa: ${customer.email}`} />
                )}
              </Link>
              <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Buscar">
                <Search size={20} />
              </button>
              <Link to="/favoritos" className={styles.iconBtn} aria-label="Favoritos">
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className={styles.badge}>{wishlistItems.length}</span>
                )}
              </Link>
              <button
                id="nc-cart-trigger"
                className={`${styles.iconBtn} ${cartPulse ? styles.cartPulse : ''}`}
                onClick={() => toggleCart(true)}
                aria-label="Carrito"
              >
                <div className={styles.cartIconWrapper}>
                  <ShoppingBag size={20} />
                  <Bow size={14} className={styles.cartBow} color="var(--color-primary)" />
                </div>
                {itemCount() > 0 && (
                  <span className={styles.badge}>{itemCount()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className={styles.mobileOverlay}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.4 }}
          >
            <div className={styles.mobileHeader}>
              <button 
                className={styles.closeBtn} 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <X size={28} />
              </button>
              <div className={styles.mobileLogo}>NC</div>
            </div>
            <div className={styles.mobileLinks}>
              {[...leftLinks, ...rightLinks].map((link) => (
                <div key={link.name} className={styles.mobileLinkItemGroup}>
                  {link.subLinks ? (
                    <>
                      <button 
                        className={styles.mobileLink}
                        onClick={() => setActiveAccordion(activeAccordion === link.name ? null : link.name)}
                      >
                        {link.name} {activeAccordion === link.name ? '−' : '+'}
                      </button>
                      <AnimatePresence>
                        {activeAccordion === link.name && (
                          <motion.div 
                            className={styles.mobileSubLinks}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            {link.subLinks.map((sub) => (
                              <Link 
                                key={sub.name} 
                                to={sub.path} 
                                className={styles.mobileSubLink}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link 
                      to={link.path} 
                      className={styles.mobileLink}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <Link 
                to="/favoritos" 
                className={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Favoritos
              </Link>
              <Link 
                to="/mi-cuenta" 
                className={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                Mi Cuenta
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
