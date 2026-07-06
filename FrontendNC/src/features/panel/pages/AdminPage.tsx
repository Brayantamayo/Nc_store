import { useState } from 'react';
import { toast } from 'sonner';
import { AdminPanelProvider, AdminTab } from '../context/AdminPanelContext';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminTopbar } from '../components/AdminTopbar';
import { DashboardPage } from './DashboardPage';
import { AnalyticsPage } from './AnalyticsPage';
import { SettingsPage } from './SettingsPage';
import { ProductosPage } from '../../productos/pages/ProductosPage';
import { PedidosPage } from '../../pedidos/pages/PedidosPage';
import {
  CategoriasPage,
  VariantePage,
  PagosPage,
  GaleriaPage,
  ClientesPage,
  VentasPage,
  BannersPage,
} from '../../adminModulos';
import { useAdminAuth } from '../hooks/useAdminAuth';
import styles from '../css/Admin.module.css';

/**
 * Panel de administración.
 * La autenticación y protección de ruta la maneja AdminGuard + useAdminAuth.
 * Este componente SOLO se renderiza cuando hay sesión válida.
 */
export const AdminPage = () => {
  const { logout } = useAdminAuth();

  const [activeTab, setActiveTab]               = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading]               = useState(false);
  const [pendingNewProduct, setPendingNewProduct] = useState(false);

  const showMessage = (text: string, type: 'success' | 'error') => {
    if (type === 'success') toast.success(text);
    else toast.error(text);
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onOpenNewProduct={() => {
              setActiveTab('productos');
              setPendingNewProduct(true);
            }}
          />
        );
      case 'productos':  return <ProductosPage />;
      case 'pedidos':    return <PedidosPage />;
      case 'galeria':    return <GaleriaPage />;
      case 'banners':    return <BannersPage />;
      case 'categoria':  return <CategoriasPage />;
      case 'variante':   return <VariantePage />;
      case 'pagos':      return <PagosPage />;
      case 'clientes':   return <ClientesPage />;
      case 'ventas':     return <VentasPage />;
      case 'analytics':  return <AnalyticsPage />;
      case 'settings':   return <SettingsPage />;
      default:           return null;
    }
  };

  const panelValue = {
    activeTab,
    setActiveTab,
    showMessage,
    isLoading,
    setIsLoading,
    onLogout: logout,
    pendingNewProduct,
    setPendingNewProduct,
  };

  return (
    <AdminPanelProvider value={panelValue}>
      <div className={styles.page}>
        <div className={styles.glowingOrb1} />
        <div className={styles.glowingOrb2} />
        <AdminSidebar />
        <main className={styles.mainContent}>
          <AdminTopbar />
          <div className={styles.tabContent}>{renderTab()}</div>
        </main>
      </div>
    </AdminPanelProvider>
  );
};

/** Alias para compatibilidad */
export const Admin = AdminPage;
