import { Trash2, Plus } from 'lucide-react';
import styles from '../../panel/css/Admin.module.css';
import type { VarianteForm, VarianteItemForm } from '../types';
import type { ProductoApiItem } from '../../productos/types';
import { ImageUploader } from '../../../../shared/components/ImageUploader';

interface VarianteFormFieldsProps {
  form: VarianteForm;
  products: ProductoApiItem[];
  onChange: (value: Partial<VarianteForm>) => void;
}

export const VarianteFormFields = ({
  form,
  products,
  onChange,
}: VarianteFormFieldsProps) => {
  const isBulk = !!form.variantes;

  const handleVariantChange = (index: number, updatedItem: Partial<VarianteItemForm>) => {
    if (!form.variantes) return;
    const newVariantes = [...form.variantes];
    newVariantes[index] = { ...newVariantes[index], ...updatedItem };
    onChange({ variantes: newVariantes });
  };

  const addVariantRow = () => {
    if (!form.variantes) return;
    onChange({
      variantes: [...form.variantes, { color: '', stock: '0', imagenes: '' }],
    });
  };

  const removeVariantRow = (index: number) => {
    if (!form.variantes) return;
    if (form.variantes.length <= 1) return;
    const newVariantes = form.variantes.filter((_, i) => i !== index);
    onChange({ variantes: newVariantes });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Selector de Producto (común para ambos modos) */}
      <div className={styles.formGroup} style={{ width: '100%' }}>
        <label className={styles.formLabel}>Producto</label>
        <select
          className={styles.selectInput}
          value={form.productoId}
          onChange={(e) => onChange({ productoId: e.target.value })}
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.nombre}
            </option>
          ))}
        </select>
      </div>

      {isBulk ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {form.variantes!.map((variant, index) => (
            <div
              key={index}
              style={{
                border: '1px solid rgba(219, 39, 119, 0.15)',
                borderRadius: '12px',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(219, 39, 119, 0.1)',
                  paddingBottom: '0.5rem',
                }}
              >
                <span style={{ fontWeight: 600, color: '#be185d', fontSize: '0.9rem' }}>
                  Variante #{index + 1}
                </span>
                {form.variantes!.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariantRow(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#db2777',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                )}
              </div>

              <div className={styles.formGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Color</label>
                  <input
                    className={styles.textInput}
                    value={variant.color}
                    onChange={(e) => handleVariantChange(index, { color: e.target.value })}
                    placeholder="Ej. Negro, Blanco, Rojo"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stock</label>
                  <input
                    className={styles.textInput}
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, { stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <ImageUploader
                  label="Subir Imágenes de la Variante"
                  value={variant.imagenes}
                  onChange={(urls) => handleVariantChange(index, { imagenes: urls })}
                  multiple={true}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addVariantRow}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px dashed #db2777',
              color: '#db2777',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <Plus size={16} /> Agregar otra variante
          </button>
        </div>
      ) : (
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Color</label>
            <input
              className={styles.textInput}
              value={form.color}
              onChange={(e) => onChange({ color: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Stock</label>
            <input
              className={styles.textInput}
              type="number"
              value={form.stock}
              onChange={(e) => onChange({ stock: e.target.value })}
              required
            />
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <ImageUploader
              label="Subir Imágenes de la Variante"
              value={form.imagenes}
              onChange={(urls) => onChange({ imagenes: urls })}
              multiple={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
