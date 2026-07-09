import { Trash2, Plus, Package } from 'lucide-react';
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
  const selectedProduct = products.find(p => String(p.id) === String(form.productoId));
  const isCombo = selectedProduct?.esCombo;
  const opcionesCombo = selectedProduct?.opcionesCombo || [];

  const handleVariantChange = (index: number, updatedItem: Partial<VarianteItemForm>) => {
    if (!form.variantes) return;
    const newVariantes = [...form.variantes];
    newVariantes[index] = { ...newVariantes[index], ...updatedItem };
    onChange({ variantes: newVariantes });
  };

  const addVariantRow = () => {
    if (!form.variantes) return;
    onChange({
      variantes: [...form.variantes, { color: '', stock: '1', imagenes: '' }],
    });
  };

  const addVariantForComboItem = (comboItemName: string) => {
    if (!form.variantes) return;
    onChange({
      variantes: [...form.variantes, { color: '', stock: '1', imagenes: '', opcionComboNombre: comboItemName }],
    });
  };

  const removeVariantRow = (index: number) => {
    if (!form.variantes) return;
    const newVariantes = form.variantes.filter((_, i) => i !== index);
    onChange({ variantes: newVariantes.length > 0 ? newVariantes : [{ color: '', stock: '1', imagenes: '' }] });
  };

  // When product changes and it's a combo, auto-initialize one row per combo item
  const handleProductChange = (productId: string) => {
    const product = products.find(p => String(p.id) === productId);
    if (product?.esCombo && product.opcionesCombo && product.opcionesCombo.length > 0 && isBulk) {
      onChange({
        productoId: productId,
        variantes: product.opcionesCombo.map(opt => ({ color: '', stock: '1', imagenes: '', opcionComboNombre: opt })),
      });
    } else {
      onChange({ productoId: productId });
    }
  };

  // Group variants by opcionComboNombre for combo display
  const getVariantsByComboItem = (comboItemName: string) => {
    if (!form.variantes) return [];
    return form.variantes
      .map((v, originalIndex) => ({ ...v, originalIndex }))
      .filter(v => v.opcionComboNombre === comboItemName);
  };

  const renderColorRow = (variant: VarianteItemForm & { originalIndex: number }, showDelete = true) => (
    <div
      key={variant.originalIndex}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.6rem 0.75rem',
        background: 'rgba(255,255,255,0.6)',
        borderRadius: '8px',
        border: '1px solid rgba(219, 39, 119, 0.08)',
      }}
    >
      <div style={{ flex: 2 }}>
        <input
          className={styles.textInput}
          value={variant.color}
          onChange={(e) => handleVariantChange(variant.originalIndex, { color: e.target.value })}
          placeholder="Color (ej: Negro)"
          style={{ margin: 0 }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <input
          className={styles.textInput}
          type="number"
          value={variant.stock}
          onChange={(e) => handleVariantChange(variant.originalIndex, { stock: e.target.value })}
          placeholder="Stock"
          style={{ margin: 0 }}
        />
      </div>
      {showDelete && (
        <button
          type="button"
          onClick={() => removeVariantRow(variant.originalIndex)}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          title="Eliminar color"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Selector de Producto */}
      <div className={styles.formGroup} style={{ width: '100%' }}>
        <label className={styles.formLabel}>Producto</label>
        <select
          className={styles.selectInput}
          value={form.productoId}
          onChange={(e) => handleProductChange(e.target.value)}
        >
          <option value="">Selecciona un producto</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.nombre} {product.esCombo ? '(Combo)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* ── COMBO MODE: Grouped by combo item ── */}
      {isBulk && isCombo && opcionesCombo.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            padding: '0.6rem 1rem',
            background: 'linear-gradient(135deg, rgba(219,39,119,0.08), rgba(219,39,119,0.03))',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#9d174d',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <Package size={16} />
            <span>Este producto es un <strong>Combo</strong>. Agrega los colores y stock para cada artículo:</span>
          </div>

          {opcionesCombo.map((comboItem) => {
            const itemVariants = getVariantsByComboItem(comboItem);
            return (
              <div
                key={comboItem}
                style={{
                  border: '1px solid rgba(219, 39, 119, 0.15)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Header del artículo */}
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #be185d, #9d174d)',
                  color: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📦 {comboItem}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    opacity: 0.85,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '20px',
                  }}>
                    {itemVariants.length} {itemVariants.length === 1 ? 'color' : 'colores'}
                  </span>
                </div>

                {/* Color rows */}
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Column headers */}
                  {itemVariants.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem', padding: '0 0.75rem', marginBottom: '0.15rem' }}>
                      <span style={{ flex: 2, fontSize: '0.75rem', color: '#9d174d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Color</span>
                      <span style={{ flex: 1, fontSize: '0.75rem', color: '#9d174d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</span>
                      <span style={{ width: '24px' }} />
                    </div>
                  )}

                  {itemVariants.map((v) => renderColorRow(v, itemVariants.length > 1))}

                  {itemVariants.length === 0 && (
                    <p style={{ fontSize: '0.85rem', color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '0.5rem 0' }}>
                      Sin colores aún. Haz clic en el botón para agregar.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => addVariantForComboItem(comboItem)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1.5px dashed rgba(219, 39, 119, 0.3)',
                      color: '#db2777',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Plus size={14} /> Agregar color
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      ) : isBulk ? (
        /* ── NORMAL BULK MODE (non-combo) ── */
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
                  />
                </div>

                <div className={styles.formGroup}>
            <label className={styles.formLabel}>Stock</label>
            <input
              className={styles.textInput}
              type="number"
              value={variant.stock}
              onChange={(e) => handleVariantChange(index, { stock: e.target.value })}
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
        /* ── SINGLE EDIT MODE ── */
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Color</label>
            <input
              className={styles.textInput}
              value={form.color}
              onChange={(e) => onChange({ color: e.target.value })}
            />
          </div>

          {isCombo && (
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Artículo del Combo</label>
              <select
                className={styles.selectInput}
                value={form.opcionComboNombre || ''}
                onChange={(e) => onChange({ opcionComboNombre: e.target.value || undefined })}
              >
                <option value="">Aplica a todo el combo (General)</option>
                {opcionesCombo.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Stock</label>
            <input
              className={styles.textInput}
              type="number"
              value={form.stock}
              onChange={(e) => onChange({ stock: e.target.value })}
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
