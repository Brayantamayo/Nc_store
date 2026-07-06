import { motion } from 'motion/react';
import { X, Mail, MapPin, Phone, User, ShoppingBag, CircleDollarSign } from 'lucide-react';
import { Order, OrderStatus } from '../../store/pages/orderStore';
import styles from '../../panel/css/Admin.module.css';

interface PedidoDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

export const PedidoDetailModal = ({ order, onClose, onStatusChange, onDelete }: PedidoDetailModalProps) => (
  <div className={styles.modalBackdrop}>
    <motion.div
      initial={{ scale: 0.96, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.96, opacity: 0, y: 12 }}
      className={`${styles.modalContent} ${styles.orderModalContent}`}
    >
      <div className={styles.orderModalHero}>
        <div>
          <p className={styles.orderModalKicker}>Detalle de pedido</p>
          <h2 className={styles.orderModalTitle}>{order.id}</h2>
          <p className={styles.orderModalSubtitle}>
            {new Date(order.createdAt).toLocaleDateString('es-CO')} · {order.customerCity}
          </p>
        </div>

        <button type="button" onClick={onClose} className={styles.closeModalBtn} aria-label="Cerrar modal">
          <X size={22} />
        </button>
      </div>

      <div className={styles.modalBody}>
        <div className={styles.orderModalSummary}>
          <div className={styles.orderModalSummaryItem}>
            <span>Total del pedido</span>
            <strong>{formatCurrency(order.total)}</strong>
          </div>
          <div className={styles.orderModalSummaryItem}>
            <span>Estado actual</span>
            <strong>{order.status}</strong>
          </div>
          <div className={styles.orderModalSummaryItem}>
            <span>Articulos</span>
            <strong>{order.items.length}</strong>
          </div>
        </div>

        <div className={styles.orderDetailGrid}>
          <section className={styles.customerSection}>
            <div className={styles.orderSectionHeader}>
              <ShoppingBag size={18} />
              <h3>Informacion de despacho</h3>
            </div>

            <div className={styles.customerGrid}>
              <div className={styles.customerField}>
                <User size={16} />
                <div>
                  <span>Nombre</span>
                  <strong>{order.customerName}</strong>
                </div>
              </div>
              <div className={styles.customerField}>
                <Mail size={16} />
                <div>
                  <span>Email</span>
                  <strong>{order.customerEmail}</strong>
                </div>
              </div>
              <div className={styles.customerField}>
                <Phone size={16} />
                <div>
                  <span>Telefono</span>
                  <strong>{order.customerPhone}</strong>
                </div>
              </div>
              <div className={styles.customerField}>
                <MapPin size={16} />
                <div>
                  <span>Ciudad</span>
                  <strong>{order.customerCity}</strong>
                </div>
              </div>
              <div className={`${styles.customerField} ${styles.fullWidth}`}>
                <MapPin size={16} />
                <div>
                  <span>Direccion</span>
                  <strong>{order.customerAddress}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.orderStatusSection}>
            <div className={styles.orderSectionHeader}>
              <CircleDollarSign size={18} />
              <h3>Actualizar estado</h3>
            </div>
            <p className={styles.orderStatusCopy}>
              Cambia el flujo del pedido sin salir de esta ventana.
            </p>
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
              className={styles.ordersStatusSelect}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="Procesando">Procesando</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </section>

          <section className={styles.orderItemsSection}>
            <div className={styles.orderSectionHeader}>
              <ShoppingBag size={18} />
              <h3>Productos solicitados</h3>
            </div>

            <div className={styles.orderItemsList}>
              {order.items.map((item, idx) => (
                <article key={idx} className={styles.orderItemCard}>
                  <img src={item.image} alt={item.productName} className={styles.orderItemImg} />
                  <div className={styles.orderItemInfo}>
                    <h4 className={styles.orderItemName}>{item.productName}</h4>
                    <div className={styles.orderItemMeta}>
                      <span>Precio: {formatCurrency(item.price)}</span>
                      <span className={styles.colorBadge}>
                        Color:
                        <span
                          className={styles.colorDot}
                          style={{ backgroundColor: item.colorHex }}
                          title={item.colorName}
                        />
                        {item.colorName}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderItemTotal}>
                    <span className={styles.orderItemTotalVal}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <div className={styles.orderItemQty}>Cantidad: {item.quantity}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className={styles.orderTotalRow}>
            <strong>Total del pedido</strong>
            <span className={styles.orderTotalVal}>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      <div className={styles.modalFooter}>
        <button
          type="button"
          onClick={() => onDelete(order.id)}
          className={styles.cancelBtn}
        >
          Eliminar pedido
        </button>
        <button type="button" onClick={onClose} className={styles.saveBtn}>
          Cerrar
        </button>
      </div>
    </motion.div>
  </div>
);
