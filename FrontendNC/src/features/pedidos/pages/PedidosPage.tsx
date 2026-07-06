import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOrderStore, Order, OrderStatus } from '../../store/pages/orderStore';
import { useAdminPanel } from '../../panel/context/AdminPanelContext';
import { pedidoService } from '../services/pedidoService';
import { PedidoDetailModal } from '../components/PedidoDetailModal';
import styles from '../../panel/css/Admin.module.css';

const statusMeta: Record<OrderStatus, string> = {
  Pendiente: styles.orderStatusPending,
  Procesando: styles.orderStatusProcessing,
  Enviado: styles.orderStatusSent,
  Entregado: styles.orderStatusDelivered,
  Cancelado: styles.orderStatusCancelled,
};

export const PedidosPage = () => {
  const { orders } = useOrderStore();
  const { setIsLoading, isLoading } = useAdminPanel();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    setIsLoading(true);
    const response = await pedidoService.actualizarEstado(orderId, status);
    setIsLoading(false);

    if (response.success) {
      toast.success(response.message || 'Pedido actualizado');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } else {
      toast.error(response.message || 'Error al actualizar');
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    toast.warning('¿Estás seguro de que deseas eliminar este pedido?', {
      description: 'Esta acción no se puede deshacer.',
      duration: Infinity,
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setIsLoading(true);
          const response = await pedidoService.eliminar(orderId);
          setIsLoading(false);
          if (response.success) {
            toast.success(response.message || 'Pedido eliminado');
            setSelectedOrder(null);
          } else {
            toast.error(response.message || 'Error al eliminar');
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  return (
    <>
      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={styles.ordersShell}>
        <div className={styles.ordersCard}>
          <div className={styles.tableHeaderArea}>
            <div>
              <h2 className={styles.ordersSectionTitle}>Pedidos realizados ({orders.length})</h2>
              <p className={styles.ordersSectionSubtitle}>
                Listado simple para revisar cliente, estado, total y acciones.
              </p>
            </div>
          </div>

          <div className={styles.ordersTableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>ID pedido</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Total COP</th>
                  <th>Estado envío</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className={styles.ordersTableRow}>
                    <td>
                      <span className={styles.ordersIdBadge}>{order.id}</span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                    <td>
                      <div className={styles.ordersCustomerInfo}>
                        <strong>{order.customerName}</strong>
                        <span>
                          {order.customerEmail} • {order.customerCity}
                        </span>
                      </div>
                    </td>
                    <td>
                      <strong className={styles.ordersTotal}>${order.total.toLocaleString('es-CO')}</strong>
                    </td>
                    <td>
                      <label className={`${styles.ordersStatusWrap} ${statusMeta[order.status]}`}>
                        <span className={styles.ordersStatusBadge}>{order.status}</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                          className={styles.ordersStatusSelect}
                          aria-label={`Cambiar estado de ${order.id}`}
                          disabled={isLoading}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Procesando">Procesando</option>
                          <option value="Enviado">Enviado</option>
                          <option value="Entregado">Entregado</option>
                          <option value="Cancelado">Cancelado</option>
                        </select>
                      </label>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className={styles.iconBtnAction}
                          title="Ver detalles del pedido"
                          aria-label={`Ver detalles de ${order.id}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className={`${styles.iconBtnAction} ${styles.iconBtnDelete}`}
                          title="Eliminar registro"
                          aria-label={`Eliminar ${order.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className={styles.ordersEmptyState}>
                        <strong>Aun no hay pedidos registrados</strong>
                        <span>Cuando lleguen nuevas compras aparecerán en este listado.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedOrder && (
          <PedidoDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onStatusChange={handleOrderStatusChange}
            onDelete={handleDeleteOrder}
          />
        )}
      </AnimatePresence>
    </>
  );
};
