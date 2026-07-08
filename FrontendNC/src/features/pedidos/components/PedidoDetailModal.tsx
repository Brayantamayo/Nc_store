import { motion } from 'motion/react';
import { useRef, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { X, Mail, MapPin, Phone, User, ShoppingBag, Download } from 'lucide-react';
import { Order, OrderStatus } from '../../store/pages/orderStore';
import styles from '../../panel/css/Admin.module.css';

interface PedidoDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
  autoDownloadPdf?: boolean;
}

const formatCurrency = (value: number) => `$${value.toLocaleString('es-CO')}`;

export const PedidoDetailModal = ({ order, onClose, onStatusChange, onDelete, autoDownloadPdf }: PedidoDetailModalProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const envio = Math.max(0, order.total - subtotal);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    const element = contentRef.current;
    
    // Temporarily remove max-height and overflow constraints to capture full content
    const originalMaxHeight = element.style.maxHeight;
    const originalOverflow = element.style.overflow;
    const bodyEl = element.querySelector(`.${styles.modalBody}`) as HTMLElement;
    const originalBodyOverflow = bodyEl ? bodyEl.style.overflowY : '';
    const footerEl = element.querySelector(`.${styles.modalFooter}`) as HTMLElement;
    const closeBtnEl = element.querySelector(`.${styles.closeModalBtn}`) as HTMLElement;

    element.style.maxHeight = 'none';
    element.style.overflow = 'visible';
    if (bodyEl) bodyEl.style.overflowY = 'visible';
    if (footerEl) footerEl.style.display = 'none';
    if (closeBtnEl) closeBtnEl.style.display = 'none';

    try {
      const opt = {
        margin: 0.4,
        filename: `pedido-${order.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 1200 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } finally {
      // Restore styles
      element.style.maxHeight = originalMaxHeight;
      element.style.overflow = originalOverflow;
      if (bodyEl) bodyEl.style.overflowY = originalBodyOverflow;
      if (footerEl) footerEl.style.display = 'flex';
      if (closeBtnEl) closeBtnEl.style.display = 'flex';
    }
  };

  useEffect(() => {
    if (autoDownloadPdf) {
      // Small timeout to ensure DOM is ready and animations finished
      const timer = setTimeout(() => {
        handleDownloadPDF().then(() => onClose());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoDownloadPdf]);

  return (
  <div className={styles.modalBackdrop}>
    <motion.div
      ref={contentRef}
      initial={{ scale: 0.96, opacity: 0, y: 12 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.96, opacity: 0, y: 12 }}
      className={`${styles.modalContent} ${styles.orderModalContent}`}
      id="pdf-content-wrapper"
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
              <h3>Detalles de facturación</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Información Personal</h4>
                <div className={styles.customerGrid}>
                  <div className={styles.customerField}>
                    <User size={16} />
                    <div>
                      <span>Nombre</span>
                      <strong>{order.customerName}</strong>
                    </div>
                  </div>
                  {order.customerLastName && (
                    <div className={styles.customerField}>
                      <User size={16} />
                      <div>
                        <span>Apellido</span>
                        <strong>{order.customerLastName}</strong>
                      </div>
                    </div>
                  )}
                  {order.customerIdType && (
                    <div className={styles.customerField}>
                      <User size={16} />
                      <div>
                        <span>Tipo ID</span>
                        <strong>{order.customerIdType}</strong>
                      </div>
                    </div>
                  )}
                  {order.customerIdNumber && (
                    <div className={styles.customerField}>
                      <User size={16} />
                      <div>
                        <span>No. ID</span>
                        <strong>{order.customerIdNumber}</strong>
                      </div>
                    </div>
                  )}
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
                      <span>Teléfono</span>
                      <strong>{order.customerPhone}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Dirección de Envío</h4>
                <div className={styles.customerGrid}>
                  {order.customerCountry && (
                    <div className={styles.customerField}>
                      <MapPin size={16} />
                      <div>
                        <span>País</span>
                        <strong>{order.customerCountry}</strong>
                      </div>
                    </div>
                  )}
                  {order.customerDepartment && (
                    <div className={styles.customerField}>
                      <MapPin size={16} />
                      <div>
                        <span>Departamento</span>
                        <strong>{order.customerDepartment}</strong>
                      </div>
                    </div>
                  )}
                  <div className={styles.customerField}>
                    <MapPin size={16} />
                    <div>
                      <span>Ciudad</span>
                      <strong>{order.customerCity}</strong>
                    </div>
                  </div>
                  {order.customerPostalCode && (
                    <div className={styles.customerField}>
                      <MapPin size={16} />
                      <div>
                        <span>Código Postal</span>
                        <strong>{order.customerPostalCode}</strong>
                      </div>
                    </div>
                  )}
                  <div className={`${styles.customerField} ${styles.fullWidth}`}>
                    <MapPin size={16} />
                    <div>
                      <span>Dirección</span>
                      <strong>
                        {order.customerAddress}
                        {order.customerAddress2 ? `, ${order.customerAddress2}` : ''}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {order.orderNotes && (
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Notas Adicionales</h4>
                  <div className={`${styles.customerField} ${styles.fullWidth}`} style={{ gridColumn: '1 / -1' }}>
                    <User size={16} />
                    <div>
                      <span>Notas del pedido</span>
                      <strong>{order.orderNotes}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(248, 187, 208, 0.1)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(74, 20, 44, 0.7)' }}>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(74, 20, 44, 0.7)' }}>
              <span>Costo de envío</span>
              <span>{formatCurrency(envio)}</span>
            </div>
            <div style={{ height: '1px', background: 'rgba(248, 187, 208, 0.3)', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#4a142c', fontSize: '0.95rem' }}>Total del pedido</strong>
              <span className={styles.orderTotalVal}>{formatCurrency(order.total)}</span>
            </div>
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
};
