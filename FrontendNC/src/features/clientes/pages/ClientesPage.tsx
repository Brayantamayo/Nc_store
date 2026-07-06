import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Package2, Users } from 'lucide-react';
import { useOrderStore } from '../../store/pages/orderStore';
import styles from '../../panel/css/Admin.module.css';

type ClientRow = {
  id: string;
  name: string;
  email: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
};

export const ClientesPage = () => {
  const orders = useOrderStore((state) => state.orders);

  const clients = useMemo<ClientRow[]>(() => {
    const grouped = new Map<string, ClientRow>();

    orders.forEach((order) => {
      const key = order.customerEmail.toLowerCase();
      const current = grouped.get(key);

      if (!current) {
        grouped.set(key, {
          id: key,
          name: order.customerName,
          email: order.customerEmail,
          city: order.customerCity,
          ordersCount: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt,
        });
        return;
      }

      current.ordersCount += 1;
      current.totalSpent += order.total;
      if (new Date(order.createdAt) > new Date(current.lastOrderDate)) {
        current.lastOrderDate = order.createdAt;
        current.city = order.customerCity;
        current.name = order.customerName;
      }
    });

    return [...grouped.values()].sort(
      (a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime(),
    );
  }, [orders]);

  const totalClients = clients.length;
  const repeatClients = clients.filter((client) => client.ordersCount > 1).length;
  const totalOrders = orders.length;

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.ordersShell}>
      <div className={styles.ordersCard}>
        <div className={styles.tableHeaderArea}>
          <div>
            <h2 className={styles.ordersSectionTitle}>Clientes ({totalClients})</h2>
            <p className={styles.ordersSectionSubtitle}>
              Personas que ya compraron en NC, agrupadas por correo para ver sus pedidos de un vistazo.
            </p>
          </div>

          <div className={styles.ordersLegend}>
            <span className={styles.ordersStatusPending}>
              <Users size={13} />
              {totalClients} clientes
            </span>
            <span className={styles.ordersStatusProcessing}>
              <Package2 size={13} />
              {repeatClients} recurrentes
            </span>
            <span className={styles.ordersStatusDelivered}>
              <Mail size={13} />
              {totalOrders} pedidos
            </span>
          </div>
        </div>

        <div className={styles.ordersTableContainer}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Ciudad</th>
                <th>Pedidos</th>
                <th>Total gastado</th>
                <th>Último pedido</th>
              </tr>
            </thead>
            <tbody>
              {clients.length > 0 ? (
                clients.map((client) => {
                  const initials = client.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={client.id} className={styles.ordersTableRow}>
                      <td>
                        <div className={styles.ordersCustomerCell}>
                          <div className={styles.ordersAvatar}>{initials || 'NC'}</div>
                          <div className={styles.ordersCustomerInfo}>
                            <strong>{client.name}</strong>
                            <span>Cliente de la tienda</span>
                          </div>
                        </div>
                      </td>
                      <td>{client.email}</td>
                      <td>{client.city}</td>
                      <td>
                        <span className={styles.ordersIdBadge}>{client.ordersCount}</span>
                      </td>
                      <td>
                        <strong className={styles.ordersTotal}>${client.totalSpent.toLocaleString('es-CO')}</strong>
                      </td>
                      <td>{new Date(client.lastOrderDate).toLocaleDateString('es-CO')}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className={styles.ordersEmptyState}>
                      <strong>Aun no hay clientes registrados</strong>
                      <span>Cuando existan pedidos, aparecerán agrupados aquí automáticamente.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
};
