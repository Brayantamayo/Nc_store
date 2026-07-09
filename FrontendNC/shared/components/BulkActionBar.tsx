import { Trash2 } from 'lucide-react';
import styles from '../../src/features/panel/css/Admin.module.css';

interface BulkActionBarProps {
  count: number;
  entityLabel: string;
  entityLabelPlural: string;
  onDelete: () => void;
  disabled?: boolean;
}

export const BulkActionBar = ({
  count,
  entityLabel,
  entityLabelPlural,
  onDelete,
  disabled = false,
}: BulkActionBarProps) => {
  if (count === 0) return null;

  const label = count === 1 ? entityLabel : entityLabelPlural;

  return (
    <div className={styles.bulkActionBar}>
      <span>
        {count} {label} seleccionada{count > 1 ? 's' : ''}
      </span>
      <button type="button" onClick={onDelete} disabled={disabled} className={styles.bulkDeleteBtn}>
        <Trash2 size={14} />
        Eliminar seleccionadas
      </button>
    </div>
  );
};
