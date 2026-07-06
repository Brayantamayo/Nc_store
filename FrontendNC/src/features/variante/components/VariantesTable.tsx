import { Edit, Package, Trash2 } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { VarianteApiItem } from '../types';

interface VariantesTableProps {
  items: VarianteApiItem[];
  loading: boolean;
  onEdit: (item: VarianteApiItem) => void;
  onDelete: (id: number) => void;
  onAdjustStock: (id: number, currentStock: number, delta: number) => void;
  onToggleStatus?: (id: number, currentActive: boolean) => void;
}

export const VariantesTable = ({ items, loading, onEdit, onDelete, onAdjustStock, onToggleStatus }: VariantesTableProps) => (
  <div className={styles.tableContainer}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Color</th>
          <th>Stock</th>
          <th>Estado</th>
          <th>Imágenes</th>
          <th style={{ textAlign: 'center' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
              Cargando variantes...
            </td>
          </tr>
        ) : items.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
              No hay variantes registradas.
            </td>
          </tr>
        ) : (
          items.map((item) => (
            <tr key={item.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      background: 'rgba(248, 187, 208, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.imagenes?.[0] ? (
                      <img
                        src={item.imagenes[0]}
                        alt={item.color}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Package size={14} />
                    )}
                  </div>
                  <span>{item.producto?.nombre ?? `Producto #${item.productoId}`}</span>
                </div>
              </td>
              <td>{item.color}</td>
              <td>{item.stock}</td>
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
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {item.imagenes.slice(0, 3).map((imgUrl, idx) => (
                    <img
                      key={idx}
                      src={imgUrl}
                      alt={`VarImg-${idx}`}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '4px',
                        objectFit: 'cover',
                        border: '1px solid rgba(248, 187, 208, 0.3)',
                      }}
                    />
                  ))}
                  {item.imagenes.length > 3 && (
                    <span style={{ fontSize: '0.75rem', color: '#c2185b', fontWeight: 600 }}>
                      +{item.imagenes.length - 3}
                    </span>
                  )}
                  {item.imagenes.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'rgba(74, 20, 44, 0.5)' }}>Sin fotos</span>
                  )}
                </div>
              </td>
              <td>
                <div className={styles.actionBtns} style={{ justifyContent: 'center', gap: '0.35rem' }}>
                  <button type="button" onClick={() => onAdjustStock(item.id, item.stock, 1)} className={styles.iconBtnAction}>
                    +1
                  </button>
                  <button type="button" onClick={() => onAdjustStock(item.id, item.stock, -1)} className={styles.iconBtnAction}>
                    -1
                  </button>
                  <button type="button" onClick={() => onEdit(item)} className={styles.iconBtnAction}>
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className={`${styles.iconBtnAction} ${styles.iconBtnDelete}`}
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
