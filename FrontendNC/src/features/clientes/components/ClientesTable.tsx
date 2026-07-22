import { Eye, PencilLine, Power, ShoppingBag } from 'lucide-react';
import type { ClienteListado } from '../types';
import styles from '../../panel/css/Admin.module.css';

interface ClientesTableProps {
  clientes: ClienteListado[];
  onView: (cliente: ClienteListado) => void;
  onEdit: (cliente: ClienteListado) => void;
  onToggleActivo: (cliente: ClienteListado) => void;
}

const formatMoney = (value: string | number | null | undefined) => {
  const amount = Number(value ?? 0);
  return `$${Number.isFinite(amount) ? amount.toLocaleString('es-CO') : '0'}`;
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return 'Sin pedidos';
  return new Date(value).toLocaleDateString('es-CO');
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const ClientesTable = ({ clientes, onView, onEdit, onToggleActivo }: ClientesTableProps) => (
  <div className={styles.ordersTableContainer}>
    <table className={styles.ordersTable}>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Email</th>
          <th>Ciudad</th>
          <th>Estado</th>
          <th>Pedidos</th>
          <th>Total gastado</th>
          <th>Ultimo pedido</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.length > 0 ? (
          clientes.map((cliente) => {
            const nombreVisible =
              cliente.usuario.nombreVisible?.trim() ||
              [cliente.usuario.nombre, cliente.usuario.apellido].filter(Boolean).join(' ').trim() ||
              'Cliente';

            return (
              <tr key={cliente.id} className={styles.ordersTableRow}>
                <td>
                  <div className={styles.ordersCustomerCell}>
                    <div className={styles.ordersAvatar}>{getInitials(nombreVisible) || 'NC'}</div>
                    <div className={styles.ordersCustomerInfo}>
                      <strong>{nombreVisible}</strong>
                      <span>{cliente.direccion || 'Cliente de la tienda'}</span>
                    </div>
                  </div>
                </td>
                <td>{cliente.usuario.email}</td>
                <td>{cliente.ciudad || 'Sin ciudad'}</td>
                <td>
                  <span
                    className={
                      cliente.activo ? styles.ordersStatusDelivered : styles.ordersStatusCancelled
                    }
                  >
                    {cliente.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <span className={styles.ordersIdBadge}>
                    <ShoppingBag size={12} />
                    {cliente._count.pedidos}
                  </span>
                </td>
                <td>
                  <strong className={styles.ordersTotal}>{formatMoney(cliente.totalGastado)}</strong>
                </td>
                <td>{formatDate(cliente.ultimoPedidoEn)}</td>
                <td>
                  <div className={styles.actionBtns}>
                    <button
                      type="button"
                      className={styles.iconBtnAction}
                      onClick={() => onView(cliente)}
                      aria-label={`Ver detalle de ${nombreVisible}`}
                      title="Ver detalle"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtnAction}
                      onClick={() => onEdit(cliente)}
                      aria-label={`Editar ${nombreVisible}`}
                      title="Editar"
                    >
                      <PencilLine size={15} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtnAction}
                      onClick={() => onToggleActivo(cliente)}
                      aria-label={`${cliente.activo ? 'Desactivar' : 'Activar'} ${nombreVisible}`}
                      title={cliente.activo ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={8}>
              <div className={styles.ordersEmptyState}>
                <strong>Aun no hay clientes registrados</strong>
                <span>Cuando existan pedidos o crees un cliente manualmente, apareceran aqui.</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
