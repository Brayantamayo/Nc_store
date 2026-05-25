import { Search, Bell, Sun, ShoppingBag, Mail } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useOrderStore } from '../../store/pages/orderStore';
import { useAdminPanel } from '../context/AdminPanelContext';
import { getAdminEmail } from '../constants/adminProfile';
import styles from '../css/Admin.module.css';

export const AdminTopbar = () => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'reports' | 'history' | 'activity'>('overview');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { setActiveTab } = useAdminPanel();
  const orders = useOrderStore((s) => s.orders);
  const readOrderIds = useOrderStore((s) => s.readOrderIds);
  const markOrderNotificationRead = useOrderStore((s) => s.markOrderNotificationRead);
  const markAllNotificationsRead = useOrderStore((s) => s.markAllNotificationsRead);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const adminEmail = getAdminEmail();

  const unreadOrders = orders.filter((o) => !readOrderIds.includes(o.id));
  const unreadCount = unreadOrders.length;
  const recentOrders = orders.slice(0, 8);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (orderId: string) => {
    markOrderNotificationRead(orderId);
    setNotificationsOpen(false);
    setActiveTab('pedidos');
  };

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} d`;
  };

  return (
    <div className={styles.topbar}>
      <div className={styles.topTabs}>
        {(['overview', 'reports', 'history', 'activity'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`${styles.topTabBtn} ${activeSubTab === tab ? styles.topTabActive : ''}`}
          >
            {tab === 'overview' && 'Executive Overview'}
            {tab === 'reports' && 'Reports'}
            {tab === 'history' && 'History'}
            {tab === 'activity' && 'Activity'}
          </button>
        ))}
      </div>

      <div className={styles.topbarActions}>
        <div className={styles.topbarSearchWrapper}>
          <Search size={14} className={styles.topbarSearchIcon} />
          <input type="text" placeholder="Buscar en el panel..." className={styles.topbarSearchInput} />
        </div>

        <div className={styles.topbarDropdownWrap} ref={notifRef}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Notificaciones de compras"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((o) => !o);
              setProfileOpen(false);
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadgeCount}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className={styles.topbarDropdown}>
              <div className={styles.dropdownHeader}>
                <h3>Compras recientes</h3>
                {unreadCount > 0 && (
                  <button type="button" className={styles.dropdownLinkBtn} onClick={markAllNotificationsRead}>
                    Marcar todas leídas
                  </button>
                )}
              </div>

              <div className={styles.dropdownList}>
                {recentOrders.length === 0 ? (
                  <p className={styles.dropdownEmpty}>No hay compras registradas.</p>
                ) : (
                  recentOrders.map((order) => {
                    const isUnread = !readOrderIds.includes(order.id);
                    return (
                      <button
                        key={order.id}
                        type="button"
                        className={`${styles.notificationItem} ${isUnread ? styles.notificationItemUnread : ''}`}
                        onClick={() => handleNotificationClick(order.id)}
                      >
                        <div className={styles.notificationIcon}>
                          <ShoppingBag size={14} />
                        </div>
                        <div className={styles.notificationBody}>
                          <span className={styles.notificationTitle}>
                            Nueva compra · {order.customerName}
                          </span>
                          <span className={styles.notificationMeta}>
                            {order.id} · ${order.total.toLocaleString('es-CO')} · {order.status}
                          </span>
                          <span className={styles.notificationTime}>{formatRelativeTime(order.createdAt)}</span>
                        </div>
                        {isUnread && <span className={styles.notificationDot} />}
                      </button>
                    );
                  })
                )}
              </div>

              {orders.length > 0 && (
                <button
                  type="button"
                  className={styles.dropdownFooterBtn}
                  onClick={() => {
                    markAllNotificationsRead();
                    setNotificationsOpen(false);
                    setActiveTab('pedidos');
                  }}
                >
                  Ver todos los pedidos
                </button>
              )}
            </div>
          )}
        </div>

        <button className={styles.iconBtn} aria-label="Modo Claro" type="button">
          <Sun size={18} />
        </button>

        <div className={styles.topbarDropdownWrap} ref={profileRef}>
          <button
            type="button"
            className={styles.avatarBtn}
            aria-label="Perfil administrador"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotificationsOpen(false);
            }}
          >
            <span className={styles.avatar}>NC</span>
          </button>

          {profileOpen && (
            <div className={`${styles.topbarDropdown} ${styles.profileDropdown}`}>
              <div className={styles.profileDropdownHeader}>
                <span className={styles.profileLabel}>Administrador</span>
              </div>
              <div className={styles.profileEmailRow}>
                <Mail size={16} />
                <a href={`mailto:${adminEmail}`} className={styles.profileEmail}>
                  {adminEmail}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
