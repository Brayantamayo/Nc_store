import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Heart, Search, Menu, X } from 'lucide-react';

import { useUIStore } from '../../store/pages/uiStore';
import { useCartStore } from '../../store/pages/cartStore';
import { useFlyToCartStore } from '../../store/pages/flyToCartStore';
import { useWishlistStore } from '../../store/pages/wishlistStore';
import { useCustomerSessionStore } from '../../Login/services/AuthServices';
import { categoriaService } from '../../categoria/services/categoriaService';
import type { CategoriaTreeItem } from '../../categoria/types';
import { Bow, CoquetteUserIcon } from './Moñito';
import styles from '../css/Navbar.module.css';

interface NavLinkItem {
  name: string;
  path: string;
  subLinks?: { name: string; path: string }[];
}

const FEATURED_LEFT = ['bolsos', 'maquillaje'];
const FEATURED_RIGHT = ['accesorios'];

const FALLBACK_LEFT: NavLinkItem[] = [
  { name: 'Inicio', path: '/' },
  {
    name: 'Bolsos',
    path: '/coleccion?category=bolsos',
    subLinks: [
      { name: 'Ver Todos', path: '/coleccion?category=bolsos' },
      { name: 'Tote Bag', path: '/coleccion?category=tote' },
      { name: 'Puffer', path: '/coleccion?category=puffer' },
      { name: 'Combos', path: '/coleccion?category=combos' },
    ],
  },
  { name: 'Maquillaje', path: '/coleccion?category=maquillaje' },
];

const FALLBACK_RIGHT: NavLinkItem[] = [
  {
    name: 'Accesorios',
    path: '/coleccion?category=accesorios',
    subLinks: [
      { name: 'Ver Todos', path: '/coleccion?category=accesorios' },
      { name: 'Monedero', path: '/coleccion?category=monedero' },
      { name: 'Cosmetiquera', path: '/coleccion?category=cosmetiquera' },
      { name: 'Accesorios para bolsos', path: '/coleccion?category=accesorios-bolsos' },
    ],
  },
  { name: 'Descuentos', path: '/coleccion?category=descuentos' },
  { name: 'Ver Todo', path: '/coleccion' },
];

const buildLink = (category: CategoriaTreeItem): NavLinkItem => ({
  name: category.nombre,
  path: `/coleccion?category=${category.slug}`,
  subLinks: category.children.length > 0
    ? [
        { name: 'Ver Todos', path: `/coleccion?category=${category.slug}` },
        ...category.children.map((child) => ({
          name: child.nombre,
          path: `/coleccion?category=${child.slug}`,
        })),
      ]
    : undefined,
});

export const Navbar = () => {
  const { pathname } = useLocation();
  const isCartPage = pathname === '/carrito';
  const isCollectionPage = pathname === '/coleccion';
  const usePearlNav = isCartPage || isCollectionPage;
  const { isMobileMenuOpen, setMobileMenuOpen, setSearchOpen } = useUIStore();
  const { toggleCart, itemCount } = useCartStore();
  const cartPulse = useFlyToCartStore((s) => s.cartPulse);
  const { items: wishlistItems } = useWishlistStore();
  const customer = useCustomerSessionStore((state) => state.customer);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [categoryTree, setCategoryTree] = useState<CategoriaTreeItem[]>([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const tree = await categoriaService.arbol();
        setCategoryTree(tree);
      } catch (error) {
        console.error('No se pudo cargar el árbol de categorías del navbar:', error);
      }
    };

    void loadCategories();
  }, []);

  const { leftLinks, rightLinks } = useMemo(() => {
    if (categoryTree.length === 0) {
      return { leftLinks: FALLBACK_LEFT, rightLinks: FALLBACK_RIGHT };
    }

    const rootsBySlug = new Map(categoryTree.map((category) => [category.slug.toLowerCase(), category] as const));
    const used = new Set<string>();

    const take = (slug: string) => {
      const category = rootsBySlug.get(slug);
      if (!category) return null;
      used.add(slug);
      return buildLink(category);
    };

    const left = [{ name: 'Inicio', path: '/' }, ...FEATURED_LEFT.map(take).filter(Boolean) as NavLinkItem[]];
    const rightFeatured = FEATURED_RIGHT.map(take).filter(Boolean) as NavLinkItem[];
    const extraRoots = categoryTree
      .filter((category) => {
        const slug = category.slug.toLowerCase();
        return !used.has(slug) && slug !== 'descuentos';
      })
      .map(buildLink);

    const discounts = rootsBySlug.has('descuentos')
      ? [buildLink(rootsBySlug.get('descuentos')!)]
      : [{ name: 'Descuentos', path: '/coleccion?category=descuentos' }];

    return {
      leftLinks: left,
      rightLinks: [...rightFeatured, ...extraRoots, ...discounts, { name: 'Ver Todo', path: '/coleccion' }],
    };
  }, [categoryTree]);

  const renderLink = (link: NavLinkItem) => (
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
  );

  return (
    <>
      <div className={styles.announcementBar}>
        <div className={styles.announcementContent}>
          <span>ENVÍO GRATUITO EN COMPRAS SUPERIORES A $300.000</span>
          <Bow size={10} color="var(--color-white)" />
          <span>ESTILO COQUETTE CHIC MEDELLÍN</span>
        </div>
      </div>

      <nav className={`${styles.nav} ${usePearlNav ? styles.cartPage : ''} ${isScrolled && !usePearlNav ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>

          <div className={styles.desktopLinksLeft}>
            {leftLinks.map(renderLink)}
          </div>

          <div className={styles.logoWrapper}>
            <Bow size={20} className={styles.logoBow} color="var(--color-primary)" />
            <Link to="/" className={styles.logo}>
              NC STORE
            </Link>
          </div>

          <div className={styles.desktopLinksRight}>
            {rightLinks.map(renderLink)}
          </div>

          <div className={styles.navIcons}>
            <Link to="/mi-cuenta" className={styles.iconBtn} aria-label="Mi Cuenta">
              <CoquetteUserIcon size={22} color="var(--color-primary)" />
              {customer && <span className={styles.sessionDot} title={`Sesion activa: ${customer.email}`} />}
            </Link>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Buscar">
              <Search size={20} />
            </button>
            <Link to="/favoritos" className={styles.iconBtn} aria-label="Favoritos">
              <Heart size={20} />
              {wishlistItems.length > 0 && <span className={styles.badge}>{wishlistItems.length}</span>}
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
              {itemCount() > 0 && <span className={styles.badge}>{itemCount()}</span>}
            </button>
          </div>
        </div>
      </nav>

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
