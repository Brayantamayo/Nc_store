//PEDIDOS DEL USUARIO
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Order } from '../../store/pages/orderStore';
import styles from '../css/Login.module.css';

interface AccountOrdersSectionProps {
  customerOrders: Order[];
}

export const AccountOrdersSection = ({ customerOrders }: AccountOrdersSectionProps) => (
  <div className={styles.sectionStack}>
    {customerOrders.length === 0 ? (
      <div className={styles.statusBanner}>
        <span>No se ha hecho ningun pedido todavia.</span>
        <Link to="/coleccion" className={styles.inlineAction}>
          EXPLORAR LOS PRODUCTOS
          <ChevronRight size={14} />
        </Link>
      </div>
    ) : (
      <div className={styles.ordersList}>
        {customerOrders.map((order) => (
          <article key={order.id} className={styles.orderCard}>
            <div>
              <strong>{order.id}</strong>
              <p>{new Date(order.createdAt).toLocaleDateString('es-CO')}</p>
            </div>
            <div>
              <span>{order.status}</span>
              <strong>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(order.total)}
              </strong>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
);
