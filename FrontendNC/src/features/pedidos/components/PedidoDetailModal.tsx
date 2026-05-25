import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Order, OrderStatus } from '../../store/pages/orderStore';
import styles from '../../panel/css/Admin.module.css';

interface PedidoDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}

export const PedidoDetailModal = ({ order, onClose, onStatusChange, onDelete }: PedidoDetailModalProps) => (
  <div className={styles.modalBackdrop}>
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className={styles.modalContent}
    >
      <div className={styles.modalHeader}>
        <h2>Detalles de Pedido {order.id}</h2>
        <button onClick={onClose} className={styles.closeModalBtn}>
          <X size={24} />
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.orderDetailGrid}>
          <div className={styles.customerSection}>
            <h3 className={styles.formLabel} style={{ fontSize: '0.95rem' }}>
              Información de Despacho
            </h3>
            <div className={styles.customerGrid}>
              <div className={styles.customerField}>
                <strong>Nombre:</strong> {order.customerName}
              </div>
              <div className={styles.customerField}>
                <strong>Email:</strong> {order.customerEmail}
              </div>
              <div className={styles.customerField}>
                <strong>Teléfono:</strong> {order.customerPhone}
              </div>
              <div className={styles.customerField}>
                <strong>Ciudad:</strong> {order.customerCity}
              </div>
              <div className={`${styles.customerField} ${styles.fullWidth}`}>
                <strong>Dirección:</strong> {order.customerAddress}
              </div>
            </div>
          </div>

          <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
            <span className={styles.formLabel}>Actualizar Estado:</span>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className={styles.statusSelect}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Procesando">Procesando</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <div>
            <h3 className={styles.formLabel} style={{ fontSize: '0.95rem', marginBottom: '0.8rem' }}>
              Productos Solicitados
            </h3>
            <div className={styles.orderItemsList}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.orderItemCard}>
                  <img src={item.image} alt={item.productName} className={styles.orderItemImg} />
                  <div className={styles.orderItemInfo}>
                    <h4 className={styles.orderItemName}>{item.productName}</h4>
                    <div className={styles.orderItemMeta}>
                      <span>Precio: ${item.price.toLocaleString('es-CO')}</span>
                      <span className={styles.colorBadge}>
                        Color:{' '}
                        <span className={styles.colorDot} style={{ backgroundColor: item.colorHex }} title={item.colorName} />
                        {item.colorName}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderItemTotal}>
                    <span className={styles.orderItemTotalVal}>
                      ${(item.price * item.quantity).toLocaleString('es-CO')}
                    </span>
                    <div className={styles.orderItemQty}>Cantidad: {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.orderTotalRow}>
            <strong>Total del Pedido</strong>
            <span className={styles.orderTotalVal}>${order.total.toLocaleString('es-CO')}</span>
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          onClick={() => onDelete(order.id)}
          className={styles.cancelBtn}
          style={{ borderColor: '#c62828', color: '#c62828', marginRight: 'auto' }}
        >
          Eliminar Pedido
        </button>
        <button type="button" onClick={onClose} className={styles.saveBtn}>
          Cerrar
        </button>
      </div>
    </motion.div>
  </div>
);
