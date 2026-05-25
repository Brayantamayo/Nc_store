import { motion } from 'motion/react';
import { Plus, RefreshCw, ShoppingBag, AlertCircle, Activity, TrendingUp } from 'lucide-react';
import { useProductStore } from '../../store/pages/productStore';
import { useOrderStore } from '../../store/pages/orderStore';
import { useAdminPanel } from '../context/AdminPanelContext';
import { pedidoService } from '../../pedidos/services/pedidoService';
import styles from '../css/Admin.module.css';

interface DashboardPageProps {
  onOpenNewProduct: () => void;
}

export const DashboardPage = ({ onOpenNewProduct }: DashboardPageProps) => {
  const { setActiveTab, showMessage, setIsLoading, onLogout } = useAdminPanel();
  const { products, resetProducts } = useProductStore();
  const { orders, addOrder } = useOrderStore();

  const totalSales = orders
    .filter((o) => o.status === 'Entregado' || o.status === 'Procesando' || o.status === 'Enviado')
    .reduce((acc, o) => acc + o.total, 0);

  const outOfStockCount = products.filter((p) => p.isSoldOut).length;
  const totalItemsCount = products.length;

  const handleSimulateOrder = () => {
    const simulated = pedidoService.simularCompra(products);
    if (!simulated) {
      showMessage('No hay productos disponibles para simular un pedido.', 'error');
      return;
    }
    addOrder(simulated);
    showMessage(`Pedido simulado creado: ${simulated.id}`, 'success');
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restaurar la base de datos de productos a su estado original?')) {
      resetProducts();
      showMessage('Base de datos restaurada correctamente.', 'success');
    }
  };

  const handleAutoOptimize = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showMessage('Capacidad de almacenamiento local y caché optimizados al 100%.', 'success');
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.dashboardGrid}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className={`${styles.glassCard} ${styles.mainHighlightCard}`}>
          <div className={styles.activeMarketTag}>ACTIVE MARKET Med</div>
          <div className={styles.mainHighlightContent}>
            <h2>Desempeño Comercial NC</h2>
            <p>Métricas y comportamiento del stock de lujo, ventas simuladas y órdenes físicas en Medellín.</p>
          </div>
          <div className={styles.mainHighlightActions}>
            <button onClick={handleSimulateOrder} className={styles.primaryPillBtn}>
              Simular Compra
            </button>
            <button onClick={() => setActiveTab('productos')} className={styles.secondaryPillBtn}>
              Ver Catálogo
            </button>
          </div>
          <svg className={styles.vectorChartBg} viewBox="0 0 300 200" fill="none">
            <defs>
              <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(240, 98, 146, 0.45)" />
                <stop offset="100%" stopColor="rgba(240, 98, 146, 0)" />
              </linearGradient>
            </defs>
            <path d="M0,150 Q40,110 80,130 T160,80 T240,110 T300,40" stroke="#c2185b" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M0,150 Q40,110 80,130 T160,80 T240,110 T300,40 L300,200 L0,200 Z" fill="url(#glowGrad)" />
            <circle cx="80" cy="130" r="5" fill="#c2185b" />
            <circle cx="160" cy="80" r="5" fill="#4a142c" />
            <circle cx="300" cy="40" r="5" fill="#c2185b" />
          </svg>
        </div>

        <div className={styles.glassCard}>
          <div className={styles.activityCardHeader}>
            <h3>Actividad Reciente</h3>
            <button
              onClick={() => setActiveTab('pedidos')}
              className={styles.secondaryPillBtn}
              style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}
            >
              Ver Todos
            </button>
          </div>
          <div className={styles.activityList}>
            {orders.slice(0, 3).map((order) => {
              const isPositive =
                order.status === 'Entregado' || order.status === 'Procesando' || order.status === 'Enviado';
              return (
                <div key={order.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <ShoppingBag size={16} />
                  </div>
                  <div className={styles.activityDetails}>
                    <h4 className={styles.activityTitle}>{order.customerName}</h4>
                    <span className={styles.activityMeta}>
                      ID: {order.id} • {order.items.length} piezas •{' '}
                      {new Date(order.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`${styles.activityValue} ${isPositive ? styles.valuePositive : styles.valueNegative}`}>
                    {isPositive ? '+' : ''}${order.total.toLocaleString('es-CO')}
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.85 }}>{order.status}</div>
                  </div>
                </div>
              );
            })}
            {orders.length === 0 && (
              <p style={{ textAlign: 'center', color: '#7d6b73', padding: '1rem' }}>No hay transacciones registradas.</p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.metricsCol}>
        <div className={`${styles.glassCard} ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <span>Ingresos Netos COP</span>
            <span className={styles.metricTrend}>
              <TrendingUp size={12} /> +12.4%
            </span>
          </div>
          <div>
            <div className={styles.metricValue}>${totalSales.toLocaleString('es-CO')}</div>
            <p className={styles.metricSubtext}>Simulados a partir de pedidos pagados</p>
          </div>
        </div>

        <div className={`${styles.glassCard} ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <span>Items en Catálogo</span>
            <span className={styles.metricTrend} style={{ color: outOfStockCount > 0 ? '#ff9800' : '#2e7d32' }}>
              {outOfStockCount} Agotados
            </span>
          </div>
          <div>
            <div className={styles.metricValue}>{totalItemsCount}</div>
            <p className={styles.metricSubtext}>Límite de almacenamiento: 30 productos</p>
          </div>
        </div>

        <div
          className={`${styles.glassCard} ${styles.activeNodesCard}`}
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800')`,
          }}
        >
          <div className={styles.activeNodesOverlay} />
          <div className={styles.nodesTag}>Live Medellín</div>
          <div className={styles.nodesInfo}>
            <h4>Sede Central El Poblado</h4>
            <p>3 centros logísticos en Medellín activos.</p>
          </div>
        </div>

        <div className={styles.quickActionsGrid}>
          <button onClick={onOpenNewProduct} className={styles.quickActionBtn}>
            <Plus size={18} className={styles.quickActionBtnIcon} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Añadir Item</span>
          </button>
          <button onClick={handleResetData} className={styles.quickActionBtn}>
            <RefreshCw size={18} className={styles.quickActionBtnIcon} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Restaurar Mocks</span>
          </button>
          <button onClick={() => setActiveTab('pedidos')} className={styles.quickActionBtn}>
            <ShoppingBag size={18} className={styles.quickActionBtnIcon} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Ver Pedidos</span>
          </button>
          <button onClick={onLogout} className={styles.quickActionBtn}>
            <AlertCircle size={18} className={styles.quickActionBtnIcon} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Cerrar Sesión</span>
          </button>
          <button onClick={handleAutoOptimize} className={`${styles.quickActionBtn} ${styles.autoOptimizeBtn}`}>
            <Activity size={16} className={styles.quickActionBtnIcon} />
            <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Auto-Optimizar Almacenamiento</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
