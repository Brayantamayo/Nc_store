import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { AdminPanelProvider, AdminTab } from '../context/AdminPanelContext';
import { AdminLogin } from '../components/AdminLogin';
import { AdminLoadingScreen } from '../components/AdminLoadingScreen';
import { AdminSidebar } from '../components/AdminSidebar';
import { AdminTopbar } from '../components/AdminTopbar';
import { DashboardPage } from './DashboardPage';
import { AnalyticsPage } from './AnalyticsPage';
import { SettingsPage } from './SettingsPage';
import { ProductosPage } from '../../productos/pages/ProductosPage';
import { PedidosPage } from '../../pedidos/pages/PedidosPage';
import {
  CategoriasPage,
  PagosPage,
  FavoritosPage,
  ClientesPage,
  VentasPage,
} from '../../adminModulos';
import { setAdminEmail, DEFAULT_ADMIN_EMAIL } from '../constants/adminProfile';
import styles from '../css/Admin.module.css';

const AUTH_LOADING_MS = 1400;

export const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pendingNewProduct, setPendingNewProduct] = useState(false);

  useEffect(() => {
    setAdminEmail(DEFAULT_ADMIN_EMAIL);

    const timer = window.setTimeout(() => {
      if (localStorage.getItem('nc-admin-session') === 'active') {
        setIsAuthenticated(true);
      }
      setIsCheckingSession(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, []);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setApiMessage({ text, type });
    setTimeout(() => setApiMessage(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);

    await new Promise((resolve) => setTimeout(resolve, AUTH_LOADING_MS));

    if (username.trim().toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase() && password === 'admin') {
      localStorage.setItem('nc-admin-session', 'active');
      setAdminEmail(DEFAULT_ADMIN_EMAIL);
      setIsLoggingIn(false);
      setIsAuthenticated(true);
    } else {
      setAuthError(`Credenciales incorrectas. Usa ${DEFAULT_ADMIN_EMAIL} / admin.`);
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('nc-admin-session');
  };

  if (isCheckingSession) {
    return <AdminLoadingScreen message="Cargando panel..." />;
  }

  if (isLoggingIn) {
    return <AdminLoadingScreen message="Iniciando sesión..." />;
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        username={username}
        password={password}
        authError={authError}
        isSubmitting={isLoggingIn}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const panelValue = {
    activeTab,
    setActiveTab,
    showMessage,
    isLoading,
    setIsLoading,
    onLogout: handleLogout,
    pendingNewProduct,
    setPendingNewProduct,
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
      case 'productos':
        return <ProductosPage />;
      case 'pedidos':
        return <PedidosPage />;
      case 'categoria':
        return <CategoriasPage />;
      case 'pagos':
        return <PagosPage />;
      case 'favoritos':
        return <FavoritosPage />;
      case 'clientes':
        return <ClientesPage />;
      case 'ventas':
        return <VentasPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <AdminPanelProvider value={panelValue}>
      <div className={styles.page}>
        <div className={styles.glowingOrb1} />
        <div className={styles.glowingOrb2} />

        <AdminSidebar />

        <main className={styles.mainContent}>
          <AdminTopbar />

          {apiMessage && (
            <div
              className={`${styles.messageBanner} ${
                apiMessage.type === 'success' ? styles.successBanner : styles.errorBanner
              }`}
              style={{ marginBottom: '1.5rem' }}
            >
              <AlertCircle size={18} />
              <span>{apiMessage.text}</span>
            </div>
          )}

          <div className={styles.tabContent}>{renderTab()}</div>
        </main>
      </div>
    </AdminPanelProvider>
  );
};

/** Alias para compatibilidad con rutas existentes */
export const Admin = AdminPage;
