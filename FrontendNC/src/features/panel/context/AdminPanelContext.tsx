import { createContext, useContext, ReactNode } from 'react';

export type AdminTab =
  | 'dashboard'
  | 'productos'
  | 'pedidos'
  | 'categoria'
  | 'pagos'
  | 'favoritos'
  | 'clientes'
  | 'ventas'
  | 'analytics'
  | 'settings';

export type MessageType = 'success' | 'error';

interface AdminPanelContextValue {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  showMessage: (text: string, type: MessageType) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onLogout: () => void;
  pendingNewProduct: boolean;
  setPendingNewProduct: (value: boolean) => void;
}

const AdminPanelContext = createContext<AdminPanelContextValue | null>(null);

export const AdminPanelProvider = ({
  value,
  children,
}: {
  value: AdminPanelContextValue;
  children: ReactNode;
}) => <AdminPanelContext.Provider value={value}>{children}</AdminPanelContext.Provider>;

export const useAdminPanel = () => {
  const ctx = useContext(AdminPanelContext);
  if (!ctx) throw new Error('useAdminPanel debe usarse dentro de AdminPanelProvider');
  return ctx;
};
