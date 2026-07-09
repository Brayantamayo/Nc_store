import { Edit, Trash2 } from 'lucide-react';
import { TableCheckbox } from '../../../../shared/components/TableCheckbox';
import styles from '../../panel/css/Admin.module.css';
import type { CategoriaApiItem } from '../types';

interface CategoriasTableProps {
  items: CategoriaApiItem[];
  loading: boolean;
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onEdit: (item: CategoriaApiItem) => void;
  onDelete: (id: number) => void;
}

export const CategoriasTable = ({
  items,
  loading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDelete,
}: CategoriasTableProps) => {
  const allSelected  = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someSelected = items.some((i) => selectedIds.has(i.id));

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableSelectCol}>
              <TableCheckbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onChange={onToggleSelectAll}
                label="Seleccionar todas"
              />
            </th>
            <th style={{ width: '60px' }}>Imagen</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Padre</th>
            <th>Slug</th>
            <th>Productos</th>
            <th>Subcats.</th>
            <th>Creado</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                Cargando categorías...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                No hay categorías registradas.
              </td>
            </tr>
          ) : (
            items.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <tr key={item.id} className={isSelected ? styles.tableRowSelected : undefined}>
                  <td className={styles.tableSelectCol}>
                    <TableCheckbox
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      label={`Seleccionar ${item.nombre}`}
                      size="sm"
                    />
                  </td>
                  <td>
                    {item.imagen ? (
                      <img
                        src={item.imagen}
                        alt={item.nombre}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '8px',
                        background: 'rgba(248, 187, 208, 0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ad1457', fontSize: '0.8rem', fontWeight: 600,
                      }}>
                        N/A
                      </div>
                    )}
                  </td>
                  <td>{item.nombre}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.25rem 0.6rem', borderRadius: '999px',
                      background: item.parentId ? 'rgba(181, 76, 124, 0.12)' : 'rgba(240, 196, 215, 0.16)',
                      color: '#a91d5f', fontSize: '0.75rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {item.parentId ? 'Subcategoría' : 'Principal'}
                    </span>
                  </td>
                  <td>{item.parent?.nombre ?? '—'}</td>
                  <td>{item.slug}</td>
                  <td>{item._count?.productos ?? 0}</td>
                  <td>{item._count?.children ?? 0}</td>
                  <td>{new Date(item.creadoEn).toLocaleDateString('es-CO')}</td>
                  <td>
                    <div className={styles.actionBtns} style={{ justifyContent: 'center' }}>
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
