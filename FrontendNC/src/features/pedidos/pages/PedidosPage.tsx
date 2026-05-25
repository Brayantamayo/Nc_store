import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { useOrderStore, Order, OrderStatus } from '../../store/pages/orderStore';
import { useProductStore } from '../../store/pages/productStore';
import { useAdminPanel } from '../../panel/context/AdminPanelContext';
import { pedidoService } from '../services/pedidoService';
import { PedidoDetailModal } from '../components/PedidoDetailModal';
import styles from '../../panel/css/Admin.module.css';

export const PedidosPage = () => {
  const { orders, addOrder } = useOrderStore();
  const products = useProductStore((s) => s.products);
  const { showMessage, setIsLoading, isLoading } = useAdminPanel();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSimulateOrder = () => {
    const simulated = pedidoService.simularCompra(products);
    if (!simulated) {
      showMessage('No hay productos disponibles para simular un pedido.', 'error');
      return;
    }
    addOrder(simulated);
    showMessage(`Pedido simulado creado: ${simulated.id}`, 'success');
  };

  const handleOrderStatusChange = async (orderId: string, status: OrderStatus) => {
    setIsLoading(true);
    const response = await pedidoService.actualizarEstado(orderId, status);
    setIsLoading(false);
    if (response.success) {
      showMessage(response.message || 'Pedido actualizado', 'success');
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } else {
      showMessage(response.message || 'Error al actualizar', 'error');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) return;
    setIsLoading(true);
    const response = await pedidoService.eliminar(orderId);
    setIsLoading(false);
    if (response.success) {
      showMessage(response.message || 'Pedido eliminado', 'success');
      setSelectedOrder(null);
    } else {
      showMessage(response.message || 'Error al eliminar', 'error');
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.glassCard}>
        <div className={styles.tableHeaderArea}>
          <h2>Pedidos Realizados ({orders.length})</h2>
          <button
            onClick={handleSimulateOrder}
            disabled={isLoading}
            className={styles.primaryPillBtn}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> SIMULAR COMPRA CLIENTE
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total COP</th>
                <th>Estado Envío</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{order.id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString('es-CO')}</td>
                  <td>
                    <div className={styles.prodTitle}>
                      <h4>{order.customerName}</h4>
                      <span>
                        {order.customerEmail} • {order.customerCity}
                      </span>
                    </div>
                  </td>
                  <td>
                    <strong>${order.total.toLocaleString('es-CO')}</strong>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value as OrderStatus)}
                      className={styles.statusSelect}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Procesando">Procesando</option>
                      <option value="Enviado">Enviado</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className={styles.iconBtnAction}
                        title="Ver detalles del pedido"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className={`${styles.iconBtnAction} ${styles.iconBtnDelete}`}
                        title="Eliminar registro"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#7d6b73' }}>
                    No hay pedidos simulados en la base de datos local.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

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
