import { AlertCircle, Plus, X } from 'lucide-react';
import { useState } from 'react';
import styles from '../../panel/css/Admin.module.css';
import type { CategoriaApiItem } from '../../categoria/types';
import type { ProductoForm } from '../types';
import { ImageUploader } from '../../../../shared/components/ImageUploader';

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
        <span>Completa los datos básicos del producto. La imagen principal se mostrará cuando no hay variante seleccionada.</span>
      </div>

      <div className={styles.formGrid}>

        {/* ── Imagen principal ──────────────────────────────────── */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <ImageUploader
            label="Imagen principal del producto"
            value={productForm.imagenPrincipal}
            onChange={(url) => onChange({ imagenPrincipal: url })}
            multiple={false}
          />
          {errors.imagenPrincipal && (
            <span className={styles.errorText}>{errors.imagenPrincipal}</span>
          )}
        </div>

        {/* ── Nombre ───────────────────────────────────────────── */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Nombre</label>
          <input
            className={`${styles.textInput} ${errors.nombre ? styles.inputError : ''}`}
            value={productForm.nombre}
            onChange={(e) => onChange({ nombre: e.target.value })}
          />
          {errors.nombre && <span className={styles.errorText}>{errors.nombre}</span>}
        </div>

        {/* ── Slug ─────────────────────────────────────────────── */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Slug</label>
          <input
            className={`${styles.textInput} ${errors.slug ? styles.inputError : ''}`}
            value={productForm.slug}
            onChange={(e) => onChange({ slug: e.target.value })}
          />
          {errors.slug && <span className={styles.errorText}>{errors.slug}</span>}
        </div>

        {/* ── Precio ───────────────────────────────────────────── */}
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

        {/* ── Precio anterior ──────────────────────────────────── */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Precio anterior (sin descuento)</label>
          <input
            className={`${styles.textInput} ${errors.precioOriginal ? styles.inputError : ''}`}
            type="number"
            placeholder="Ej. 60000 (debe ser mayor al precio actual)"
            value={productForm.precioOriginal}
            onChange={(e) => onChange({ precioOriginal: e.target.value })}
          />
          {errors.precioOriginal && <span className={styles.errorText}>{errors.precioOriginal}</span>}
        </div>

        {/* ── Categoría ────────────────────────────────────────── */}
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

        {/* ── Descripción ──────────────────────────────────────── */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Descripción</label>
          <textarea
            className={`${styles.textareaInput} ${errors.descripcion ? styles.inputError : ''}`}
            value={productForm.descripcion}
            onChange={(e) => onChange({ descripcion: e.target.value })}
          />
          {errors.descripcion && <span className={styles.errorText}>{errors.descripcion}</span>}
        </div>

        {/* ── Activo ───────────────────────────────────────────── */}
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

        {/* ── Es Combo ─────────────────────────────────────────── */}
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
            <span>
              {productForm.esCombo
                ? 'Sí, requiere seleccionar colores por artículo'
                : 'No, es producto normal'}
            </span>
          </label>
        </div>

        {/* ── Artículos del combo ──────────────────────────────── */}
        {productForm.esCombo && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.formLabel}>Artículos del Combo</label>
            <p style={{ fontSize: '0.85rem', color: 'rgba(74,20,44,0.6)', marginBottom: '0.75rem' }}>
              Añade los artículos que incluye este combo. El cliente elegirá el color para cada uno.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                className={styles.textInput}
                placeholder="Ej: Baguette LOW COST"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); }
                }}
              />
              <button
                type="button"
                onClick={handleAddOption}
                className={styles.primaryPillBtn}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Plus size={15} /> Añadir
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {(productForm.opcionesCombo || []).map((opt, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 1rem',
                    background: 'rgba(248,187,208,0.1)',
                    border: '1px solid rgba(194,24,91,0.12)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.88rem', color: '#4a142c' }}>{opt}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    style={{ background: 'none', border: 'none', color: '#c2185b', cursor: 'pointer', display: 'flex' }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              {(productForm.opcionesCombo?.length ?? 0) === 0 && (
                <p style={{ fontSize: '0.85rem', color: 'rgba(74,20,44,0.4)', fontStyle: 'italic' }}>
                  Sin artículos aún.
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};
