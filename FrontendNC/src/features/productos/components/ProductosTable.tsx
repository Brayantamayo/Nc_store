import { Edit, Package, Trash2 } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { ProductoApiItem } from '../types';

interface ProductosTableProps {
  items: ProductoApiItem[];
  loading: boolean;
  onEdit: (item: ProductoApiItem) => void;
  onDelete: (id: number) => void;
  onToggleStatus?: (id: number, currentActive: boolean) => void;
}

export const ProductosTable = ({ items, loading, onEdit, onDelete, onToggleStatus }: ProductosTableProps) => (
  <div className={styles.tableContainer}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Variantes</th>
          <th>Estado</th>
          <th style={{ textAlign: 'center' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={6}>
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <Package size={24} />
                </div>
                <p className={styles.emptyStateText}>Cargando productos...</p>
              </div>
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={6}>
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <Package size={24} />
                </div>
                <p className={styles.emptyStateText}>No hay productos registrados.</p>
              </div>
            </td>
          </tr>
        ) : (
          items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className={styles.tableProductCell}>
                  <div className={styles.tableProductIcon} style={{ padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.variantes?.[0]?.imagenes?.[0] ? (
                      <img
                        src={item.variantes[0].imagenes[0]}
                        alt={item.nombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Package size={16} />
                    )}
                  </div>
                  <div className={styles.tableProductInfo}>
                    <span className={styles.tableProductName}>{item.nombre}</span>
                    <span className={styles.tableProductSlug}>{item.slug}</span>
                  </div>
                </div>
              </td>
              <td>{item.categoria.nombre}</td>
              <td>${Number(item.precio).toLocaleString('es-CO')}</td>
              <td>{item._count.variantes}</td>
              <td>
                <button
                  type="button"
                  className={`${styles.statusBadge} ${item.activo ? styles.statusActive : styles.statusInactive}`}
                  onClick={() => onToggleStatus?.(item.id, item.activo)}
                  title={item.activo ? 'Clic para desactivar' : 'Clic para activar'}
                >
                  <span className={styles.statusDot} />
                  {item.activo ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td>
                <div className={styles.actionBtns} style={{ justifyContent: 'center' }}>
                  <button type="button" onClick={() => onEdit(item)} className={styles.iconBtnAction} title="Editar">
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className={`${styles.iconBtnAction} ${styles.iconBtnDelete}`}
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);
