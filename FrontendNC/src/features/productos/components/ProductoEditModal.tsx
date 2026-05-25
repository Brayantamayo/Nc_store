import { motion } from 'motion/react';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { Product, ColorOption } from '../../../types';
import styles from '../../panel/css/Admin.module.css';

export interface ProductoEditModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  productForm: Partial<Product>;
  fieldErrors: Record<string, string>;
  newTag: string;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUrlChange: (index: number, value: string) => void;
  onColorChange: (index: number, field: keyof ColorOption, value: string) => void;
  onAddColorRow: () => void;
  onRemoveColorRow: (index: number) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onNewTagChange: (value: string) => void;
}

export const ProductoEditModal = ({
  isOpen,
  editingProduct,
  productForm,
  fieldErrors,
  newTag,
  isLoading,
  onClose,
  onSubmit,
  onInputChange,
  onImageUrlChange,
  onColorChange,
  onAddColorRow,
  onRemoveColorRow,
  onAddTag,
  onRemoveTag,
  onNewTagChange,
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
          <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className={styles.closeModalBtn}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
            {Object.keys(fieldErrors).length > 0 && (
              <div className={`${styles.messageBanner} ${styles.errorBanner}`} style={{ marginTop: 0 }}>
                <AlertCircle size={18} />
                <span>Corrige los errores del formulario para poder continuar.</span>
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Nombre del Producto <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={productForm.name}
                  onChange={onInputChange}
                  className={`${styles.textInput} ${fieldErrors.name ? styles.inputError : ''}`}
                  placeholder="ej: Bolso Canela"
                />
                {fieldErrors.name && <span className={styles.errorContainer}>{fieldErrors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Precio (COP) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={productForm.price || ''}
                  onChange={onInputChange}
                  className={`${styles.textInput} ${fieldErrors.price ? styles.inputError : ''}`}
                  placeholder="ej: 380000"
                />
                {fieldErrors.price && <span className={styles.errorContainer}>{fieldErrors.price}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Categoría <span className={styles.required}>*</span>
                </label>
                <select
                  name="category"
                  value={productForm.category}
                  onChange={onInputChange}
                  className={`${styles.selectInput} ${fieldErrors.category ? styles.inputError : ''}`}
                  style={{ borderRadius: '12px', padding: '0.75rem 1.1rem' }}
                >
                  <option value="tote">Tote Bag</option>
                  <option value="clutch">Clutch</option>
                  <option value="crossbody">Crossbody</option>
                  <option value="mini">Mini Bag</option>
                  <option value="shopper">Shopper</option>
                </select>
                {fieldErrors.category && <span className={styles.errorContainer}>{fieldErrors.category}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Material <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="material"
                  value={productForm.material}
                  onChange={onInputChange}
                  className={`${styles.textInput} ${fieldErrors.material ? styles.inputError : ''}`}
                  placeholder="ej: Cuero Vegano"
                />
                {fieldErrors.material && <span className={styles.errorContainer}>{fieldErrors.material}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.formLabel}>
                  Descripción del Producto <span className={styles.required}>*</span>
                </label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={onInputChange}
                  className={`${styles.textareaInput} ${fieldErrors.description ? styles.inputError : ''}`}
                  placeholder="Describe el encanto y los detalles de esta pieza..."
                />
                {fieldErrors.description && <span className={styles.errorContainer}>{fieldErrors.description}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <h3 className={styles.subSectionTitle}>Imágenes</h3>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Imagen Principal (URL) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    value={productForm.images?.[0] || ''}
                    onChange={(e) => onImageUrlChange(0, e.target.value)}
                    className={`${styles.textInput} ${fieldErrors.images ? styles.inputError : ''}`}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                  <label className={styles.formLabel}>Imagen Secundaria (URL)</label>
                  <input
                    type="text"
                    value={productForm.images?.[1] || ''}
                    onChange={(e) => onImageUrlChange(1, e.target.value)}
                    className={styles.textInput}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                {fieldErrors.images && <span className={styles.errorContainer}>{fieldErrors.images}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <h3 className={styles.subSectionTitle}>Colores</h3>
                <div className={styles.colorsFlex}>
                  {productForm.colors?.map((color, idx) => (
                    <div key={idx} className={styles.colorConfigRow}>
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => onColorChange(idx, 'hex', e.target.value)}
                        className={styles.colorPicker}
                      />
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => onColorChange(idx, 'name', e.target.value)}
                        placeholder="Nombre del color (ej. Canela)"
                        className={`${styles.textInput} ${fieldErrors.colors ? styles.inputError : ''}`}
                        style={{ flex: 1 }}
                      />
                      {productForm.colors!.length > 1 && (
                        <button type="button" onClick={() => onRemoveColorRow(idx)} className={styles.removeRowBtn} style={{ color: '#c62828' }}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={onAddColorRow} className={styles.addColorBtn} style={{ marginTop: '0.4rem' }}>
                  + AÑADIR COLOR
                </button>
                {fieldErrors.colors && <span className={styles.errorContainer}>{fieldErrors.colors}</span>}
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <h3 className={styles.subSectionTitle}>Etiquetas</h3>
                <div className={styles.tagsFlex}>
                  {productForm.tags?.map((tag) => (
                    <span key={tag} className={styles.tagChip}>
                      {tag}
                      <button type="button" onClick={() => onRemoveTag(tag)} className={styles.removeTagBtn}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className={styles.tagInputWrapper}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => onNewTagChange(e.target.value)}
                    placeholder="Añadir tag (ej. Tendencia)"
                    className={styles.textInput}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onAddTag();
                      }
                    }}
                  />
                  <button type="button" onClick={onAddTag} className={styles.tagMiniBtn}>
                    +
                  </button>
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <h3 className={styles.subSectionTitle}>Banderas del Producto</h3>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  {(['isNew', 'isFeatured', 'isSoldOut'] as const).map((flag) => (
                    <label key={flag} className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        name={flag}
                        checked={!!productForm[flag]}
                        onChange={onInputChange}
                        className={styles.toggleInput}
                      />
                      <span className={styles.toggleSwitch} />
                      <span>{flag === 'isNew' ? 'Es Nuevo' : flag === 'isFeatured' ? 'Destacado' : 'Agotado'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className={styles.saveBtn}>
              {isLoading ? 'Guardando...' : editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
