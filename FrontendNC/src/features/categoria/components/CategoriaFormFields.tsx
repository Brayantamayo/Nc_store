import styles from '../../panel/css/Admin.module.css';
import type { CategoriaForm, CategoriaTreeItem } from '../types';
import { ImageUploader } from '../../../../shared/components/ImageUploader';

interface CategoriaFormFieldsProps {
  form: CategoriaForm;
  categories: CategoriaTreeItem[];
  onChange: (value: Partial<CategoriaForm>) => void;
  errors?: Partial<Record<keyof CategoriaForm, string>>;
}

export const CategoriaFormFields = ({ form, categories, onChange, errors = {} }: CategoriaFormFieldsProps) => {
  return (
    <div className={styles.formGrid}>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Nombre</label>
        <input
          className={`${styles.textInput} ${errors.nombre ? styles.inputError : ''}`}
          value={form.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
        />
        {errors.nombre && <span className={styles.errorText}>{errors.nombre}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Slug</label>
        <input
          className={`${styles.textInput} ${errors.slug ? styles.inputError : ''}`}
          value={form.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
        />
        {errors.slug && <span className={styles.errorText}>{errors.slug}</span>}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Categoría padre</label>
        <select
          className={`${styles.selectInput} ${errors.parentId ? styles.inputError : ''}`}
          value={form.parentId}
          onChange={(e) => onChange({ parentId: e.target.value })}
        >
          <option value="">Categoría principal</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nombre}
            </option>
          ))}
        </select>
        {errors.parentId && <span className={styles.errorText}>{errors.parentId}</span>}
        <small style={{ display: 'block', marginTop: '0.35rem', color: '#8b5e75' }}>
          Las categorías principales aparecen en el menú. Las subcategorías se agrupan dentro de ellas.
        </small>
      </div>

      <div className={`${styles.formGroup} ${styles.fullWidth}`}>
        <ImageUploader
          label="Subir Imagen de Categoría"
          value={form.imagen}
          onChange={(url) => onChange({ imagen: url })}
        />
      </div>
    </div>
  );
};
