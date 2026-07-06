import { motion } from 'motion/react';
import { X, Pencil } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { CategoriaApiItem } from '../../categoria/types';
import type { ProductoForm } from '../types';
import { ProductoFormFields } from './ProductoFormFields.tsx';

interface ProductoEditModalProps {
  isOpen: boolean;
  editingId: number | null;
  productForm: ProductoForm;
  categories: CategoriaApiItem[];
  errors?: Partial<Record<keyof ProductoForm, string>>;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (value: Partial<ProductoForm>) => void;
}

export const ProductoEditModal = ({
  isOpen,
  productForm,
  categories,
  errors,
  isLoading,
  onClose,
  onSubmit,
  onChange,
}: ProductoEditModalProps) => {
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
            <span className={styles.modalHeaderIcon} style={{ background: 'linear-gradient(135deg,#f06292,#c2185b)' }}>
              <Pencil size={15} />
            </span>
            <div>
              <h2 className={styles.bannerModalTitle}>Editar Producto</h2>
              <p className={styles.bannerModalSub}>Modifica los datos del producto y guarda los cambios</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeModalBtn}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
            <ProductoFormFields
              productForm={productForm}
              categories={categories}
              errors={errors}
              onChange={onChange}
            />
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
