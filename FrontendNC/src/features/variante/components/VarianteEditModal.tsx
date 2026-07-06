import { motion } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { VarianteForm } from '../types';
import type { ProductoApiItem } from '../../productos/types';
import { VarianteFormFields } from './VarianteFormFields';

interface VarianteEditModalProps {
  isOpen: boolean;
  editingId: number | null;
  form: VarianteForm;
  products: ProductoApiItem[];
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (value: Partial<VarianteForm>) => void;
}

export const VarianteEditModal = ({
  isOpen,
  editingId,
  form,
  products,
  isLoading,
  onClose,
  onSubmit,
  onChange,
}: VarianteEditModalProps) => {
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
            <span className={styles.modalHeaderIcon} style={{ background: 'linear-gradient(135deg,#ec407a,#880e4f)' }}>
              <Sparkles size={15} />
            </span>
            <div>
              <h2 className={styles.bannerModalTitle}>Editar Variante</h2>
              <p className={styles.bannerModalSub}>Actualiza el color, stock o imágenes de la variante</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeModalBtn}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
            <VarianteFormFields form={form} products={products} onChange={onChange} />
          </div>
          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
            <button type="submit" disabled={isLoading} className={styles.saveBtn}>
              {isLoading ? 'Guardando…' : 'Actualizar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
