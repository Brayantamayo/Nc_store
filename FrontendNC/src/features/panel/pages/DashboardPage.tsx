import { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShoppingBag, TrendingUp, DollarSign, Package,
  AlertTriangle, Plus, ArrowUpRight, Clock, CheckCircle,
  Truck, XCircle, BarChart2, Users, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useProductStore } from '../../store/pages/productStore';
import { useOrderStore } from '../../store/pages/orderStore';
import { useAdminPanel } from '../context/AdminPanelContext';
import styles from '../css/Admin.module.css';

interface DashboardPageProps {
  onOpenNewProduct: () => void;
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Pendiente:  { label: 'Pendiente',  color: '#b45309', bg: 'rgba(251,191,36,0.12)',  icon: <Clock size={12} /> },
  Procesando: { label: 'Procesando', color: '#1d4ed8', bg: 'rgba(59,130,246,0.12)',  icon: <BarChart2 size={12} /> },
  Enviado:    { label: 'Enviado',    color: '#0369a1', bg: 'rgba(14,165,233,0.12)',  icon: <Truck size={12} /> },
  Entregado:  { label: 'Entregado',  color: '#15803d', bg: 'rgba(34,197,94,0.12)',   icon: <CheckCircle size={12} /> },
  Cancelado:  { label: 'Cancelado',  color: '#b91c1c', bg: 'rgba(239,68,68,0.12)',   icon: <XCircle size={12} /> },
};

export const DashboardPage = ({ onOpenNewProduct }: DashboardPageProps) => {
  const { products } = useProductStore();
  const { orders, loadOrders, hasLoaded } = useOrderStore();
  const { setActiveTab } = useAdminPanel();

  useEffect(() => {
    if (!hasLoaded) {
      loadOrders();
    }
  }, [hasLoaded, loadOrders]);

  // ── Métricas ─────────────────────────────────────────────────────────────
  const ingresos = orders
    .filter((o) => ['Entregado', 'Procesando', 'Enviado'].includes(o.status))
    .reduce((acc, o) => acc + o.total, 0);

  const pendientes  = orders.filter((o) => o.status === 'Pendiente').length;
  const enviados    = orders.filter((o) => o.status === 'Enviado').length;
  const entregados  = orders.filter((o) => o.status === 'Entregado').length;
  const agotados    = products.filter((p) => p.isSoldOut).length;
  const disponibles = products.filter((p) => !p.isSoldOut).length;

  // Clientes únicos
  const uniqueCustomers = new Set(orders.map((o) => o.customerEmail)).size;
  const validOrders = orders.filter(o => ['Entregado', 'Procesando', 'Enviado'].includes(o.status));
  const ticketPromedio = validOrders.length > 0 ? ingresos / validOrders.length : 0;

  // ── Datos Reales para Banner y Tendencias ─────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const ordersToday = orders.filter(o => new Date(o.createdAt) >= today);
  const ordersYesterday = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= yesterday && d < today;
  });

  const ventasHoy = ordersToday.filter(o => ['Entregado', 'Procesando', 'Enviado'].includes(o.status)).reduce((acc, o) => acc + o.total, 0);
  const ventasAyer = ordersYesterday.filter(o => ['Entregado', 'Procesando', 'Enviado'].includes(o.status)).reduce((acc, o) => acc + o.total, 0);

  const pedidosHoy = ordersToday.length;
  const pedidosAyer = ordersYesterday.length;

  const calcTrend = (current: number, past: number) => {
    if (past === 0) return current > 0 ? { val: '+100%', pos: true } : null;
    const diff = current - past;
    const pct = Math.round((diff / past) * 100);
    return { val: `${pct > 0 ? '+' : ''}${pct}%`, pos: pct >= 0 };
  };

  const kpis = [
    {
      label: 'Ingresos Totales',
      value: formatCOP(ingresos),
      sub: `${entregados} pedidos entregados`,
      icon: <DollarSign size={20} />,
      color: '#15803d',
      bg: 'rgba(34,197,94,0.1)',
      trend: calcTrend(ventasHoy, ventasAyer),
      accent: '#15803d'
    },
    {
      label: 'Pedidos Totales',
      value: String(orders.length),
      sub: `${pendientes} pendientes · ${enviados} enviados`,
      icon: <ShoppingBag size={20} />,
      color: '#c2185b',
      bg: 'rgba(194,24,91,0.1)',
      trend: calcTrend(pedidosHoy, pedidosAyer),
      accent: '#c2185b'
    },
    {
      label: 'Ticket Promedio',
      value: formatCOP(ticketPromedio || 0),
      sub: 'Por pedido registrado',
      icon: <TrendingUp size={20} />,
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.1)',
      trend: null,
      accent: '#7c3aed'
    },
    {
      label: 'Clientes Únicos',
      value: String(uniqueCustomers),
      sub: `${orders.length} compras totales`,
      icon: <Users size={20} />,
      color: '#0369a1',
      bg: 'rgba(14,165,233,0.1)',
      trend: null,
      accent: '#0369a1'
    },
    {
      label: 'Catálogo',
      value: String(products.length),
      sub: `${disponibles} disponibles`,
      icon: <Package size={20} />,
      color: '#d97706',
      bg: 'rgba(245,158,11,0.1)',
      trend: null,
      accent: '#d97706'
    },
    {
      label: 'Stock Agotado',
      value: String(agotados),
      sub: agotados > 0 ? 'Requiere atención' : 'Todo en orden',
      icon: <AlertTriangle size={20} />,
      color: agotados > 0 ? '#b91c1c' : '#15803d',
      bg: agotados > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      trend: agotados > 0 ? { val: `+${agotados}`, pos: false } : null,
      accent: agotados > 0 ? '#b91c1c' : '#15803d'
    },
  ];

  // Datos reales para gráfico de barras CSS (Últimos 7 días)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const chartDataRaw = last7Days.map(date => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    
    const dayOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= date && d < nextDay;
    });
    
    const val = dayOrders.filter(o => ['Entregado', 'Procesando', 'Enviado'].includes(o.status)).reduce((acc, o) => acc + o.total, 0);
    
    return {
      day: date.toLocaleDateString('es-CO', { weekday: 'short' }),
      val,
    };
  });

  const maxChartVal = Math.max(...chartDataRaw.map(d => d.val), 1);
  const chartData = chartDataRaw.map(d => ({
    ...d,
    pct: Math.round((d.val / maxChartVal) * 100)
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={styles.dashboardRoot}
    >

      {/* ── Banner de Bienvenida ─────────────────────────────────────────── */}
      <div className={styles.welcomeBanner}>
        <div className={styles.welcomeText}>
          <h2>Resumen del Día</h2>
          <p>Aquí tienes un vistazo de cómo van las métricas hoy.</p>
        </div>
        <div className={styles.welcomeStats}>
          <div className={styles.welcomeStat}>
            <span className={styles.welcomeStatValue}>{formatCOP(ventasHoy)}</span>
            <span className={styles.welcomeStatLabel}>Ventas de Hoy</span>
          </div>
          <div className={styles.welcomeStat}>
            <span className={styles.welcomeStatValue}>{pedidosHoy}</span>
            <span className={styles.welcomeStatLabel}>Pedidos de Hoy</span>
          </div>
        </div>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div 
            key={k.label} 
            className={`${styles.kpiCard2} ${styles.dashCard}`} 
            style={{ '--card-accent': k.accent } as React.CSSProperties}
          >
            <div className={styles.kpiCard2Top}>
              <span className={styles.kpiCard2Label}>{k.label}</span>
              <span className={styles.kpiCard2Icon} style={{ background: k.bg, color: k.color }}>
                {k.icon}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.2rem' }}>
              <span className={styles.kpiCard2Value} style={{ color: k.color }}>{k.value}</span>
              {k.trend && (
                <span className={`${styles.trendBadge} ${k.trend.pos ? styles.trendPositive : styles.trendNegative}`}>
                  {k.trend.pos ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {k.trend.val}
                </span>
              )}
            </div>
            <span className={styles.kpiCard2Sub}>{k.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Fila central ──────────────────────────────────────────────────── */}
      <div className={styles.dashboardMidRow}>

        {/* Estado de pedidos y gráfico */}
        <div className={styles.dashCard} style={{ flex: 1.5 }}>
          <div className={styles.dashCardHeader}>
            <h3 className={styles.dashCardTitle}>Rendimiento de Ventas (Últimos 7 días)</h3>
          </div>
          
          <div className={styles.cssBarChart}>
            {chartData.map((d, idx) => (
              <div key={idx} className={styles.cssBarCol} title={formatCOP(d.val)}>
                <div className={styles.cssBarWrap}>
                  <div className={styles.cssBarFill} style={{ height: `${d.pct}%` }}></div>
                </div>
                <span className={styles.cssBarLabel}>{d.day}</span>
              </div>
            ))}
          </div>

          <div className={styles.statusBreakdown} style={{ marginTop: '2rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: '#4a142c', marginBottom: '1rem', fontWeight: 600 }}>Desglose por Estado</h4>
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const count = orders.filter((o) => o.status === key).length;
              const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
              return (
                <div key={key} className={styles.statusBreakdownRow}>
                  <div className={styles.statusBreakdownLeft}>
                    <span className={styles.statusBreakdownDot} style={{ background: meta.color }} />
                    <span className={styles.statusBreakdownLabel}>{meta.label}</span>
                  </div>
                  <div className={styles.statusBreakdownBar}>
                    <div
                      className={styles.statusBreakdownFill}
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                  <span className={styles.statusBreakdownCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
          {/* Productos más pedidos */}
          <div className={styles.dashCard} style={{ flex: 1 }}>
            <div className={styles.dashCardHeader}>
              <h3 className={styles.dashCardTitle}>Productos Top</h3>
              <button
                type="button"
                className={styles.dashCardLink}
                onClick={() => setActiveTab('productos')}
              >
                Ver más <ArrowUpRight size={13} />
              </button>
            </div>

            <div className={styles.topProductsList}>
              {(() => {
                const counts: Record<string, { name: string; qty: number; img: string }> = {};
                orders.forEach((o) =>
                  o.items.forEach((item) => {
                    if (!counts[item.productId]) {
                      counts[item.productId] = { name: item.productName, qty: 0, img: item.image ?? '' };
                    }
                    counts[item.productId].qty += item.quantity;
                  })
                );
                const sorted = Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 4);

                if (sorted.length === 0) {
                  return <p className={styles.dashEmptyMsg}>Aún no hay pedidos.</p>;
                }

                return sorted.map((p, i) => (
                  <div key={p.name} className={styles.topProductRow}>
                    <span className={styles.topProductRank}>#{i + 1}</span>
                    {p.img && (
                      <img src={p.img} alt={p.name} className={styles.topProductImg} />
                    )}
                    <span className={styles.topProductName}>{p.name}</span>
                    <span className={styles.topProductQty}>{p.qty} uds.</span>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className={styles.dashCard}>
            <div className={styles.dashCardHeader}>
              <h3 className={styles.dashCardTitle}>Acciones rápidas</h3>
            </div>
            <div className={styles.quickActionsCol}>
              <button type="button" className={styles.quickActionRow} onClick={onOpenNewProduct}>
                <span className={styles.quickActionRowIcon} style={{ background: 'rgba(194,24,91,0.1)', color: '#c2185b' }}>
                  <Plus size={16} />
                </span>
                <div>
                  <span className={styles.quickActionRowLabel}>Nuevo producto</span>
                  <span className={styles.quickActionRowSub}>Agregar al catálogo</span>
                </div>
                <ArrowUpRight size={14} className={styles.quickActionRowArrow} />
              </button>

              <button type="button" className={styles.quickActionRow} onClick={() => setActiveTab('pedidos')}>
                <span className={styles.quickActionRowIcon} style={{ background: 'rgba(59,130,246,0.1)', color: '#1d4ed8' }}>
                  <ShoppingBag size={16} />
                </span>
                <div>
                  <span className={styles.quickActionRowLabel}>Ver pedidos</span>
                  <span className={styles.quickActionRowSub}>{orders.length} registrados</span>
                </div>
                <ArrowUpRight size={14} className={styles.quickActionRowArrow} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabla pedidos recientes ────────────────────────────────────────── */}
      <div className={styles.dashCard}>
        <div className={styles.dashCardHeader}>
          <h3 className={styles.dashCardTitle}>Pedidos recientes</h3>
          <button
            type="button"
            className={styles.dashCardLink}
            onClick={() => setActiveTab('pedidos')}
          >
            Ver todos <ArrowUpRight size={13} />
          </button>
        </div>

        <div className={styles.recentOrdersTable}>
          <div className={styles.recentOrdersHead}>
            <span>ID</span>
            <span>Cliente</span>
            <span>Productos</span>
            <span>Fecha</span>
            <span>Total</span>
            <span>Estado</span>
          </div>

          {orders.length === 0 ? (
            <p className={styles.dashEmptyMsg} style={{ padding: '2rem', textAlign: 'center' }}>
              Aún no hay pedidos registrados.
            </p>
          ) : (
            orders.slice(0, 5).map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META['Pendiente'];
              return (
                <div key={order.id} className={styles.recentOrdersRow}>
                  <span className={styles.recentOrderId}>{order.id}</span>
                  <div className={styles.recentOrderCustomer}>
                    <span className={styles.recentOrderName}>{order.customerName}</span>
                    <span className={styles.recentOrderEmail}>{order.customerEmail}</span>
                  </div>
                  <span className={styles.recentOrderItems}>{order.items.length} pza{order.items.length !== 1 ? 's' : ''}</span>
                  <span className={styles.recentOrderDate}>
                    {new Date(order.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className={styles.recentOrderTotal} style={{ fontWeight: 600 }}>{formatCOP(order.total)}</span>
                  <span
                    className={styles.recentOrderStatus}
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </motion.div>
  );
};
