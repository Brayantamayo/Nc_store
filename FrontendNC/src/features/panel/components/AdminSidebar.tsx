import { Link } from 'react-router-dom';
import {
  Layout,
  Package,
  ShoppingBag,
  TrendingUp,
  Settings,
  FolderTree,
  CreditCard,
  Heart,
  Users,
  BarChart3,
} from 'lucide-react';
import { Bow } from '../../home/components/Moñito';
import { AdminTab, useAdminPanel } from '../context/AdminPanelContext';
import styles from '../css/Admin.module.css';

type MenuItem = { id: AdminTab; label: string; icon: React.ReactNode };

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Panel',
    items: [{ id: 'dashboard', label: 'Dashboard', icon: <Layout size={18} /> }],
  },
  {
    title: 'Catálogo y ventas',
    items: [
      { id: 'productos', label: 'Inventario', icon: <Package size={18} /> },
      { id: 'categoria', label: 'Categorías', icon: <FolderTree size={18} /> },
      { id: 'pedidos', label: 'Pedidos', icon: <ShoppingBag size={18} /> },
      { id: 'pagos', label: 'Pagos', icon: <CreditCard size={18} /> },
      { id: 'ventas', label: 'Ventas', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: 'Clientes',
    items: [
      { id: 'favoritos', label: 'Favoritos', icon: <Heart size={18} /> },
      { id: 'clientes', label: 'Clientes', icon: <Users size={18} /> },
    ],
  },
  {
    title: 'Reportes',
    items: [
      { id: 'analytics', label: 'Análisis', icon: <TrendingUp size={18} /> },
      { id: 'settings', label: 'Ajustes', icon: <Settings size={18} /> },
    ],
  },
];

export const AdminSidebar = () => {
  const { activeTab, setActiveTab } = useAdminPanel();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <div className={styles.sidebarLogoWrapper}>
          <Bow size={20} color="var(--color-primary)" />
          <span className={styles.brandLogo}>NC ADMIN</span>
        </div>
        <span className={styles.brandSub}>Taller de Estilo</span>
      </div>

      <div className={styles.sidebarScroll}>
        <nav className={styles.sidebarMenu} aria-label="Menú del panel">
          {menuSections.map((section) => (
            <div key={section.title} className={styles.sidebarSection}>
              <span className={styles.sidebarSectionTitle}>{section.title}</span>
              <div className={styles.sidebarSectionList}>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`${styles.sidebarBtn} ${activeTab === item.id ? styles.sidebarBtnActive : ''}`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <Link to="/" className={styles.sidebarFooterBtn}>
        Volver a la Tienda
      </Link>
    </aside>
  );
};
