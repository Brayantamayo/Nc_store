//NAVEGACION DE LA CUENTA
import { FileText, House, LogOut, MapPin, Package, User } from 'lucide-react';
import styles from '../css/Login.module.css';

export type AccountSection = 'dashboard' | 'orders' | 'downloads' | 'addresses' | 'account';

const menuItems: Array<{
  id: AccountSection;
  label: string;
  icon: typeof House;
}> = [
  { id: 'dashboard', label: 'Escritorio', icon: House },
  { id: 'orders', label: 'Pedidos', icon: Package },
  { id: 'downloads', label: 'Descargas', icon: FileText },
  { id: 'addresses', label: 'Direcciones', icon: MapPin },
  { id: 'account', label: 'Detalles de la cuenta', icon: User },
];

interface AccountSidebarProps {
  activeSection: AccountSection;
  onChangeSection: (section: AccountSection) => void;
  onLogout: () => void;
}

export const AccountSidebar = ({ activeSection, onChangeSection, onLogout }: AccountSidebarProps) => (
  <aside className={styles.accountSidebar}>
    {menuItems.map((item) => {
      const Icon = item.icon;
      const isActive = activeSection === item.id;
      return (
        <button
          key={item.id}
          type="button"
          className={`${styles.sidebarItem} ${isActive ? styles.sidebarItemActive : ''}`}
          onClick={() => onChangeSection(item.id)}
        >
          <span>{item.label}</span>
          <Icon size={16} />
        </button>
      );
    })}

    <button type="button" className={styles.sidebarItem} onClick={onLogout}>
      <span>Salir</span>
      <LogOut size={16} />
    </button>
  </aside>
);
