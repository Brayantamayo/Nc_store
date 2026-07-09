import { motion, AnimatePresence } from 'motion/react';
import { Trash2, X } from 'lucide-react';
import styles from '../../src/features/panel/css/Admin.module.css';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Sí, eliminar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <div className={styles.confirmDeleteBackdrop} onClick={onCancel}>
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className={styles.confirmDeleteModal}
          onClick={(e) => e.stopPropagation()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-title"
          aria-describedby="confirm-delete-desc"
        >
          <button type="button" onClick={onCancel} className={styles.confirmDeleteClose} aria-label="Cerrar">
            <X size={16} />
          </button>

          <div className={styles.confirmDeleteIconCircle}>
            <Trash2 size={24} />
          </div>

          <h3 id="confirm-delete-title" className={styles.confirmDeleteTitle}>
            {title}
          </h3>
          <p id="confirm-delete-desc" className={styles.confirmDeleteDesc}>
            {description}
          </p>

          <div className={styles.confirmDeleteActions}>
            <button type="button" onClick={onCancel} disabled={isLoading} className={styles.confirmDeleteCancelBtn}>
              {cancelLabel}
            </button>
            <button type="button" onClick={onConfirm} disabled={isLoading} className={styles.confirmDeleteBtn}>
              {isLoading ? 'Eliminando…' : confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
