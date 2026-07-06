import { motion } from 'motion/react';
import { X, FolderPlus } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { CategoriaForm, CategoriaTreeItem } from '../types';
import { CategoriaFormFields } from './CategoriaFormFields';

interface CategoriaCreateModalProps {
  isOpen: boolean;
  form: CategoriaForm;
  categories: CategoriaTreeItem[];
  errors?: Partial<Record<keyof CategoriaForm, string>>;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (value: Partial<CategoriaForm>) => void;
}

export const CategoriaCreateModal = ({
  isOpen,
  form,
  categories,
  errors,
  isLoading,
  onClose,
  onSubmit,
  onChange,
}: CategoriaCreateModalProps) => {
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
            <span className={styles.modalHeaderIcon} style={{ background: 'linear-gradient(135deg,#7b1fa2,#4a148c)' }}>
              <FolderPlus size={16} />
            </span>
            <div>
              <h2 className={styles.bannerModalTitle}>Nueva Categoría</h2>
              <p className={styles.bannerModalSub}>Crea una categoría para organizar los productos</p>
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
              {isLoading ? 'Guardando…' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
