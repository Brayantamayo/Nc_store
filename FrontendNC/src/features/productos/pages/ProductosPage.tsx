import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Product, ColorOption } from '../../../types';
import { useProductStore } from '../../store/pages/productStore';
import { useAdminPanel } from '../../panel/context/AdminPanelContext';
import { productoService } from '../services/productoService';
import { ProductoEditModal } from '../components/ProductoEditModal';
import styles from '../../panel/css/Admin.module.css';

const emptyForm = (): Partial<Product> => ({
  name: '',
  price: 0,
  category: 'tote',
  material: '',
  description: '',
  images: ['', ''],
  colors: [{ name: '', hex: '#e8a0b4' }],
  tags: ['Esencial'],
  isNew: true,
  isSoldOut: false,
  isFeatured: false,
});

export const ProductosPage = () => {
  const { products } = useProductStore();
  const { showMessage, setIsLoading, isLoading, pendingNewProduct, setPendingNewProduct } = useAdminPanel();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>(emptyForm());
  const [newTag, setNewTag] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let result = products;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }
    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    if (pendingNewProduct) {
      openProductModal(null);
      setPendingNewProduct(false);
    }
  }, [pendingNewProduct, setPendingNewProduct]);

  const openProductModal = (product: Product | null = null) => {
    setFieldErrors({});
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product });
    } else {
      setEditingProduct(null);
      setProductForm(emptyForm());
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setFieldErrors({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setProductForm((prev) => ({ ...prev, [name]: value }));
    }
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    setProductForm((prev) => {
      const imgs = [...(prev.images || [])];
      imgs[index] = value;
      return { ...prev, images: imgs };
    });
    if (fieldErrors.images) setFieldErrors((prev) => ({ ...prev, images: '' }));
  };

  const handleColorChange = (index: number, field: keyof ColorOption, value: string) => {
    setProductForm((prev) => {
      const updatedColors = [...(prev.colors || [])];
      updatedColors[index] = { ...updatedColors[index], [field]: value };
      return { ...prev, colors: updatedColors };
    });
    if (fieldErrors.colors) setFieldErrors((prev) => ({ ...prev, colors: '' }));
  };

  const addColorRow = () => {
    setProductForm((prev) => ({
      ...prev,
      colors: [...(prev.colors || []), { name: '', hex: '#c2185b' }],
    }));
  };

  const removeColorRow = (index: number) => {
    setProductForm((prev) => {
      const updatedColors = [...(prev.colors || [])];
      if (updatedColors.length > 1) updatedColors.splice(index, 1);
      return { ...prev, colors: updatedColors };
    });
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !productForm.tags?.includes(tag)) {
      setProductForm((prev) => ({ ...prev, tags: [...(prev.tags || []), tag] }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setProductForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tagToRemove),
    }));
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({});
    const response = await productoService.guardar(productForm, !!editingProduct);
    setIsLoading(false);
    if (response.success) {
      showMessage(response.message || 'Operación exitosa', 'success');
      closeProductModal();
    } else {
      if (response.errors) setFieldErrors(response.errors);
      showMessage(response.message || 'Error al guardar el producto', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    setIsLoading(true);
    const response = await productoService.eliminar(id);
    setIsLoading(false);
    showMessage(
      response.message || (response.success ? 'Producto eliminado' : 'Error al eliminar'),
      response.success ? 'success' : 'error'
    );
  };

  const handleToggleSoldOut = async (product: Product) => {
    const updated = { ...product, isSoldOut: !product.isSoldOut };
    await useProductStore.getState().updateProduct(product.id, updated);
    showMessage(`Producto marcado como ${updated.isSoldOut ? 'Agotado' : 'Disponible'}`, 'success');
  };

  const handleToggleFeatured = async (product: Product) => {
    const updated = { ...product, isFeatured: !product.isFeatured };
    await useProductStore.getState().updateProduct(product.id, updated);
    showMessage(`Producto ${updated.isFeatured ? 'añadido a' : 'quitado de'} destacados`, 'success');
  };

  const handleToggleNew = async (product: Product) => {
    const updated = { ...product, isNew: !product.isNew };
    await useProductStore.getState().updateProduct(product.id, updated);
    showMessage(`Producto ${updated.isNew ? 'marcado como' : 'quitado de'} nuevo`, 'success');
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.glassCard}>
        <div className={styles.tableHeaderArea}>
          <h2>Catálogo de Productos ({products.length})</h2>
          <button
            onClick={() => openProductModal(null)}
            className={styles.primaryPillBtn}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> NUEVO PRODUCTO
          </button>
        </div>

        <div className={styles.tableSearchRow}>
          <div className={styles.tableSearchBox}>
            <Search size={14} className={styles.topbarSearchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por nombre o material..."
              className={styles.topbarSearchInput}
              style={{ width: '100%' }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.topbarSearchInput}
            style={{ width: '200px', padding: '0.5rem 1rem' }}
          >
            <option value="all">Todas las Categorías</option>
            <option value="tote">Totes</option>
            <option value="clutch">Clutches</option>
            <option value="crossbody">Crossbodies</option>
            <option value="mini">Minis</option>
            <option value="shopper">Shopper</option>
          </select>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Atributos Rápidos</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className={styles.prodCell}>
                      <img src={product.images[0] || 'https://placehold.co/100'} alt={product.name} className={styles.prodImg} />
                      <div className={styles.prodTitle}>
                        <h4>{product.name}</h4>
                        <span>{product.material}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.badgeCategory}>{product.category}</span>
                  </td>
                  <td>
                    <strong style={{ whiteSpace: 'nowrap' }}>${product.price.toLocaleString('es-CO')}</strong>
                  </td>
                  <td>
                    <div className={styles.toggleWrapper}>
                      <label className={styles.toggleLabel}>
                        <input type="checkbox" checked={product.isSoldOut} onChange={() => handleToggleSoldOut(product)} className={styles.toggleInput} />
                        <span className={styles.toggleSwitch} />
                        <span>Agotado</span>
                      </label>
                      <label className={styles.toggleLabel}>
                        <input type="checkbox" checked={product.isFeatured} onChange={() => handleToggleFeatured(product)} className={styles.toggleInput} />
                        <span className={styles.toggleSwitch} />
                        <span>Destacado</span>
                      </label>
                      <label className={styles.toggleLabel}>
                        <input type="checkbox" checked={product.isNew} onChange={() => handleToggleNew(product)} className={styles.toggleInput} />
                        <span className={styles.toggleSwitch} />
                        <span>Nuevo</span>
                      </label>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionBtns} style={{ justifyContent: 'center' }}>
                      <button onClick={() => openProductModal(product)} className={styles.iconBtnAction} title="Editar producto">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={`${styles.iconBtnAction} ${styles.iconBtnDelete}`}
                        title="Eliminar producto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#7d6b73' }}>
                    No se encontraron piezas en el inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isProductModalOpen && (
          <ProductoEditModal
            isOpen={isProductModalOpen}
            editingProduct={editingProduct}
            productForm={productForm}
            fieldErrors={fieldErrors}
            newTag={newTag}
            isLoading={isLoading}
            onClose={closeProductModal}
            onSubmit={handleSaveProductSubmit}
            onInputChange={handleInputChange}
            onImageUrlChange={handleImageUrlChange}
            onColorChange={handleColorChange}
            onAddColorRow={addColorRow}
            onRemoveColorRow={removeColorRow}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onNewTagChange={setNewTag}
          />
        )}
      </AnimatePresence>
    </>
  );
};
