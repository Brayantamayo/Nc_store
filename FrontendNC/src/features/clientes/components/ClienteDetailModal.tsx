import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, CreditCard, Mail, MapPin, PencilLine, ShoppingBag, User, X } from 'lucide-react';
import { clienteService } from '../services/clienteService';
import type { ClienteDetalle } from '../types';
import styles from '../../panel/css/Admin.module.css';

interface ClienteDetailModalProps {
  clienteId: number;
  onClose: () => void;
  onEdit: (cliente: ClienteDetalle) => void;
}

const formatMoney = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0);
  return `$${Number.isFinite(amount) ? amount.toLocaleString('es-CO') : '0'}`;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Sin informacion';
  return new Date(value).toLocaleDateString('es-CO');
};

export const ClienteDetailModal = ({ clienteId, onClose, onEdit }: ClienteDetailModalProps) => {
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCliente = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await clienteService.obtenerPorId(clienteId);
        if (active) setCliente(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle del cliente.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadCliente();

    return () => {
      active = false;
    };
  }, [clienteId]);

  const nombreVisible = useMemo(() => {
    if (!cliente) return 'Cliente';
    return (
      cliente.usuario.nombreVisible?.trim() ||
      [cliente.usuario.nombre, cliente.usuario.apellido].filter(Boolean).join(' ').trim() ||
      'Cliente'
    );
  }, [cliente]);

  return (
    <div className={styles.modalBackdrop}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 12 }}
        className={styles.modalContent}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2>Detalle de cliente</h2>
          </div>
          <button type="button" onClick={onClose} className={styles.closeModalBtn} aria-label="Cerrar modal">
            <X size={22} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.ordersEmptyState}>
              <strong>Cargando cliente</strong>
              <span>Estamos trayendo su informacion y sus pedidos recientes.</span>
            </div>
          ) : error ? (
            <div className={styles.ordersEmptyState}>
              <strong>No se pudo abrir el detalle</strong>
              <span>{error}</span>
            </div>
          ) : cliente ? (
            <div className={styles.orderDetailGrid}>
              <section className={styles.customerSection}>
                <div className={styles.orderSectionHeader}>
                  <User size={18} />
                  <h3>{nombreVisible}</h3>
                </div>

                <div className={styles.customerGrid}>
                  <div className={styles.customerField}>
                    <Mail size={16} />
                    <div>
                      <span>Email</span>
                      <strong>{cliente.usuario.email}</strong>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <MapPin size={16} />
                    <div>
                      <span>Ciudad</span>
                      <strong>{cliente.ciudad || 'Sin ciudad'}</strong>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <MapPin size={16} />
                    <div>
                      <span>Direccion</span>
                      <strong>{cliente.direccion || 'Sin direccion'}</strong>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <CreditCard size={16} />
                    <div>
                      <span>Codigo postal</span>
                      <strong>{cliente.codigoPostal || 'Sin codigo'}</strong>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <CalendarDays size={16} />
                    <div>
                      <span>Registrado</span>
                      <strong>{formatDate(cliente.creadoEn)}</strong>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <ShoppingBag size={16} />
                    <div>
                      <span>Pedidos</span>
                      <strong>{cliente._count.pedidos}</strong>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <CreditCard size={16} />
                    <div>
                      <span>Total gastado</span>
                      <strong>{formatMoney(cliente.totalGastado)}</strong>
                    </div>
                  </div>
                  <div className={styles.customerField}>
                    <CalendarDays size={16} />
                    <div>
                      <span>Ultimo pedido</span>
                      <strong>{formatDate(cliente.ultimoPedidoEn)}</strong>
                    </div>
                  </div>
                  {cliente.region ? (
                    <div className={`${styles.customerField} ${styles.fullWidth}`}>
                      <MapPin size={16} />
                      <div>
                        <span>Region</span>
                        <strong>{cliente.region}</strong>
                      </div>
                    </div>
                  ) : null}
                  {cliente.direccion2 ? (
                    <div className={`${styles.customerField} ${styles.fullWidth}`}>
                      <MapPin size={16} />
                      <div>
                        <span>Direccion extra</span>
                        <strong>{cliente.direccion2}</strong>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>

              <section className={styles.orderItemsSection}>
                <div className={styles.orderSectionHeader}>
                  <ShoppingBag size={18} />
                  <h3>Pedidos recientes</h3>
                </div>

                <div className={styles.orderItemsList}>
                  {cliente.pedidos.length > 0 ? (
                    cliente.pedidos.map((pedido) => (
                      <article key={pedido.id} className={styles.activityItem}>
                        <div>
                          <strong>{pedido.id}</strong>
                          <div className={styles.activityMeta}>
                            {pedido.estado} - {formatDate(pedido.creadoEn)}
                          </div>
                        </div>
                        <div className={styles.activityValue}>
                          <strong>{formatMoney(pedido.total)}</strong>
                          <div className={styles.activityMeta}>{pedido._count.items} items</div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className={styles.ordersEmptyState}>
                      <strong>No hay pedidos recientes</strong>
                      <span>Este cliente aun no tiene pedidos visibles en el historial.</span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : null}
        </div>

        <div className={styles.modalFooter}>
          {!isLoading && cliente ? (
            <button type="button" onClick={() => onEdit(cliente)} className={styles.cancelBtn}>
              <PencilLine size={16} />
              Editar cliente
            </button>
          ) : null}
          <button type="button" onClick={onClose} className={styles.saveBtn}>
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
