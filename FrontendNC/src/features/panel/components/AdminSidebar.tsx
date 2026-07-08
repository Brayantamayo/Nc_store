import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layout,
  Package,
  ShoppingBag,
  TrendingUp,
  Settings,
  FolderTree,
  CreditCard,
  Users,
  BarChart3,
  Sparkles,
  ChevronDown,
  MonitorPlay,
  Image as ImageIcon,
  Store,
  Megaphone,
  LineChart,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { Bow } from '../../home/components/Moñito';
import { AdminTab, useAdminPanel } from '../context/AdminPanelContext';
import styles from '../css/Admin.module.css';

type MenuItem = {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
};

type MenuSection = {
  title: string;
  sectionIcon: React.ReactNode;
  accentColor: string;
  items: MenuItem[];
};

const menuSections: MenuSection[] = [
  {
    title: 'Panel',
    sectionIcon: <Layout size={15} />,
    accentColor: '#e91e8c',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <Layout size={16} /> },
    ],
  },
  {
    title: 'Catálogo y ventas',
    sectionIcon: <Store size={15} />,
    accentColor: '#c2185b',
    items: [
      { id: 'productos',  label: 'Productos',  icon: <Package size={16} /> },
      { id: 'categoria',  label: 'Categorías', icon: <FolderTree size={16} /> },
      { id: 'variante',   label: 'Variantes',  icon: <Sparkles size={16} /> },
      { id: 'pedidos',    label: 'Pedidos',    icon: <ShoppingBag size={16} /> },
      { id: 'pagos',      label: 'Pagos',      icon: <CreditCard size={16} /> },
      { id: 'ventas',     label: 'Ventas',     icon: <BarChart3 size={16} /> },
    ],
  },
  {
    title: 'Clientes',
    sectionIcon: <Users size={15} />,
    accentColor: '#7b1fa2',
    items: [
      { id: 'clientes', label: 'Clientes', icon: <Users size={16} /> },
    ],
  },
  {
    title: 'Landing page',
    sectionIcon: <Megaphone size={15} />,
    accentColor: '#f06292',
    items: [
      { id: 'banners', label: 'Banners',  icon: <MonitorPlay size={16} /> },
      { id: 'galeria', label: 'Galería',  icon: <ImageIcon size={16} /> },
    ],
  },
  {
    title: 'Reportes',
    sectionIcon: <LineChart size={15} />,
    accentColor: '#ad1457',
    items: [
      { id: 'analytics', label: 'Análisis', icon: <TrendingUp size={16} /> },
      { id: 'settings',  label: 'Ajustes',  icon: <Settings size={16} /> },
    ],
  },
];

export const AdminSidebar = () => {
  const { activeTab, setActiveTab, onLogout } = useAdminPanel();

  const [openSections, setOpenSections] = useState<string[]>(() => {
    const active = menuSections.find((s) => s.items.some((i) => i.id === activeTab));
    return active ? [active.title] : [menuSections[0].title];
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <aside className={styles.sidebar}>

      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className={styles.sidebarBrand}>
        <div className={styles.sidebarLogoWrapper}>
          <div className={styles.sidebarLogoIcon}>
            <Bow size={18} color="#fff" />
          </div>
          <div className={styles.sidebarBrandText}>
            <span className={styles.brandLogo}>NC ADMIN</span>
            <span className={styles.brandSub}>Taller de Estilo</span>
          </div>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div className={styles.sidebarDivider} />

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <div className={styles.sidebarScroll}>
        <nav className={styles.sidebarMenu} aria-label="Menú del panel">
          {menuSections.map((section) => {
            const isOpen = openSections.includes(section.title);
            const hasActive = section.items.some((i) => i.id === activeTab);

            return (
              <div key={section.title} className={styles.sidebarSection}>

                <button
                  type="button"
                  className={`${styles.sidebarSectionHeader} ${hasActive ? styles.sidebarSectionHeaderActive : ''}`}
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={isOpen}
                  style={{ '--section-accent': section.accentColor } as React.CSSProperties}
                >
                  <div className={styles.sidebarSectionLeft}>
                    <span
                      className={styles.sidebarSectionIconWrap}
                      style={{ background: `${section.accentColor}18`, color: section.accentColor }}
                    >
                      {section.sectionIcon}
                    </span>
                    <span className={styles.sidebarSectionTitle}>{section.title}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`${styles.accordionIcon} ${isOpen ? styles.accordionIconOpen : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className={styles.sidebarSectionList}>
                    {section.items.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveTab(item.id)}
                          className={`${styles.sidebarBtn} ${isActive ? styles.sidebarBtnActive : ''}`}
                          style={isActive ? { '--btn-accent': section.accentColor } as React.CSSProperties : undefined}
                        >
                          <span className={`${styles.sidebarBtnIcon} ${isActive ? styles.sidebarBtnIconActive : ''}`}
                            style={isActive ? { color: section.accentColor } : undefined}
                          >
                            {item.icon}
                          </span>
                          <span className={styles.sidebarBtnLabel}>{item.label}</span>
                          {isActive && (
                            <span
                              className={styles.sidebarBtnDot}
                              style={{ background: section.accentColor }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </nav>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div className={styles.sidebarDivider} />
      <div className={styles.sidebarFooter}>
        <button
          type="button"
          className={styles.sidebarLogoutBtn}
          onClick={onLogout}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
