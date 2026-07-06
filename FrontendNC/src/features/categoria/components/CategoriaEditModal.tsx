import { motion } from 'motion/react';
import { X, FolderTree } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { CategoriaForm, CategoriaTreeItem } from '../types';
import { CategoriaFormFields } from './CategoriaFormFields';

interface CategoriaEditModalProps {
  isOpen: boolean;
  editingId: number | null;
  form: CategoriaForm;
  categories: CategoriaTreeItem[];
  errors?: Partial<Record<keyof CategoriaForm, string>>;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (value: Partial<CategoriaForm>) => void;
}

export const CategoriaEditModal = ({
  isOpen,
  editingId,
  form,
  categories,
  errors,
  isLoading,
  onClose,
  onSubmit,
  onChange,
}: CategoriaEditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={styles.modalContent}
      >
        <div className={styles.modalHeader}>
          <div className={styles.bannerModalTitleWrap}>
            <span className={styles.modalHeaderIcon} style={{ background: 'linear-gradient(135deg,#9c27b0,#4a148c)' }}>
              <FolderTree size={15} />
            </span>
            <div>
              <h2 className={styles.bannerModalTitle}>Editar Categoría</h2>
              <p className={styles.bannerModalSub}>Actualiza el nombre, slug o imagen de la categoría</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeModalBtn}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
            <CategoriaFormFields form={form} categories={categories} errors={errors} onChange={onChange} />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
            <button type="submit" disabled={isLoading} className={styles.saveBtn}
              style={isLoading ? undefined : { background: 'linear-gradient(135deg,#9c27b0,#4a148c)' }}>
              {isLoading ? 'Guardando…' : 'Actualizar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
