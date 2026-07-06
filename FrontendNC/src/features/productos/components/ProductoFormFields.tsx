import { AlertCircle } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { CategoriaApiItem } from '../../categoria/types';
import type { ProductoForm } from '../types';

interface ProductoFormFieldsProps {
  productForm: ProductoForm;
  categories: CategoriaApiItem[];
  onChange: (value: Partial<ProductoForm>) => void;
  errors?: Partial<Record<keyof ProductoForm, string>>;
}

export const ProductoFormFields = ({
  productForm,
  categories,
  onChange,
  errors = {},
}: ProductoFormFieldsProps) => {
  return (
    <>
      <div className={styles.messageBanner} style={{ marginTop: 0 }}>
        <AlertCircle size={18} />
        <span>Completa los datos básicos del producto y guarda para publicarlo.</span>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Nombre</label>
          <input
            className={`${styles.textInput} ${errors.nombre ? styles.inputError : ''}`}
            value={productForm.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
          />
          {errors.nombre && <span className={styles.errorText}>{errors.nombre}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Slug</label>
          <input
            className={`${styles.textInput} ${errors.slug ? styles.inputError : ''}`}
            value={productForm.slug}
            onChange={(e) => onChange({ slug: e.target.value })}
          />
          {errors.slug && <span className={styles.errorText}>{errors.slug}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Precio</label>
          <input
            className={`${styles.textInput} ${errors.precio ? styles.inputError : ''}`}
            type="number"
            value={productForm.precio}
            onChange={(e) => onChange({ precio: e.target.value })}
          />
          {errors.precio && <span className={styles.errorText}>{errors.precio}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Precio Anterior (Sin descuento)</label>
          <input
            className={`${styles.textInput} ${errors.precioOriginal ? styles.inputError : ''}`}
            type="number"
            placeholder="Ej. 60000 (Debe ser mayor al precio actual)"
            value={productForm.precioOriginal}
            onChange={(e) => onChange({ precioOriginal: e.target.value })}
          />
          {errors.precioOriginal && <span className={styles.errorText}>{errors.precioOriginal}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Categoría</label>
          <select
            className={`${styles.selectInput} ${errors.categoriaId ? styles.inputError : ''}`}
            value={productForm.categoriaId}
            onChange={(e) => onChange({ categoriaId: e.target.value })}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          {errors.categoriaId && <span className={styles.errorText}>{errors.categoriaId}</span>}
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Descripción</label>
          <textarea
            className={`${styles.textareaInput} ${errors.descripcion ? styles.inputError : ''}`}
            value={productForm.descripcion}
            onChange={(e) => onChange({ descripcion: e.target.value })}
          />
          {errors.descripcion && <span className={styles.errorText}>{errors.descripcion}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Activo</label>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={productForm.activo}
              onChange={(e) => onChange({ activo: e.target.checked })}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSwitch} />
            <span>{productForm.activo ? 'Sí' : 'No'}</span>
          </label>
        </div>
      </div>
    </>
  );
};
