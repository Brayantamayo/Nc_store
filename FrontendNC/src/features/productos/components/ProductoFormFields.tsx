import { AlertCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
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
  const [newOption, setNewOption] = useState('');

  const handleAddOption = () => {
    if (!newOption.trim()) return;
    const currentOptions = productForm.opcionesCombo || [];
    onChange({ opcionesCombo: [...currentOptions, newOption.trim()] });
    setNewOption('');
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = productForm.opcionesCombo || [];
    onChange({ opcionesCombo: currentOptions.filter((_, i) => i !== index) });
  };

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

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Es Combo</label>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={productForm.esCombo}
              onChange={(e) => onChange({ esCombo: e.target.checked })}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSwitch} />
            <span>{productForm.esCombo ? 'Sí, requiere seleccionar colores por artículo' : 'No, es producto normal'}</span>
          </label>
        </div>

        {productForm.esCombo && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Artículos del Combo</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Añade los bolsos o artículos que incluye este combo. El cliente elegirá el color para cada uno.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                className={styles.textInput}
                placeholder="Ej: Baguette LOW COST"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
              />
              <button 
                type="button" 
                onClick={handleAddOption}
                style={{ padding: '0 1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> Añadir
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(productForm.opcionesCombo || []).map((opt, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <span>{opt}</span>
                  <button type="button" onClick={() => handleRemoveOption(i)} style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              {productForm.opcionesCombo?.length === 0 && (
                <p style={{ fontSize: '0.9rem', color: '#888', fontStyle: 'italic' }}>No has añadido ningún artículo al combo.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
