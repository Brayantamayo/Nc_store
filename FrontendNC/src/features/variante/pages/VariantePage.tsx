import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Filter, Plus } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../../panel/css/Admin.module.css';
import { PaginationControls } from '../../../../shared/components/PaginationControls';
import { productoService } from '../../productos/services/productoService';
import { varianteService } from '../services/varianteService';
import type { ProductoApiItem } from '../../productos/types';
import type { VarianteApiItem, VarianteForm } from '../types';
import { VariantesTable } from '../components/VariantesTable';
import { VarianteCreateModal } from '../components/VarianteCreateModal';
import { VarianteEditModal } from '../components/VarianteEditModal';

const emptyForm = (isBulk = false): VarianteForm => {
  if (isBulk) {
    return {
      productoId: '',
      color: '',
      stock: '0',
      imagenes: '',
      variantes: [{ color: '', stock: '0', imagenes: '' }],
    };
  }
  return {
    productoId: '',
    color: '',
    stock: '0',
    imagenes: '',
  };
};

export const VariantePage = () => {
  const [items, setItems] = useState<VarianteApiItem[]>([]);
  const [products, setProducts] = useState<ProductoApiItem[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterProductId, setFilterProductId] = useState('');
  const [form, setForm] = useState<VarianteForm>(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedProductName = useMemo(() => {
    if (!filterProductId) return 'Todas las variantes';
    const product = products.find((item) => String(item.id) === filterProductId);
    return product ? `Variantes de ${product.nombre}` : 'Variantes filtradas';
  }, [filterProductId, products]);

  const loadProducts = async () => {
    const response = await productoService.listar(1, 100);
    setProducts(response.data);
  };

  const load = async (currentPage = page, productId = filterProductId) => {
    setLoading(true);
    try {
      const response = productId
        ? await varianteService.listarPorProducto(Number(productId), currentPage, 10)
        : await varianteService.listar(currentPage, 10);
      setItems(response.data);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    void load(page, filterProductId);
  }, [page, filterProductId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(true));
    setIsModalOpen(true);
  };

  const openEdit = (item: VarianteApiItem) => {
    setEditingId(item.id);
    setForm({
      productoId: String(item.productoId),
      color: item.color,
      stock: String(item.stock),
      imagenes: item.imagenes.join(', '),
      opcionComboNombre: item.opcionComboNombre || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const payload: Record<string, any> = {
          color: form.color.trim(),
          stock: Number(form.stock),
          imagenes: form.imagenes
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        };
        if (form.opcionComboNombre) {
          payload.opcionComboNombre = form.opcionComboNombre;
        } else {
          payload.opcionComboNombre = null;
        }
        await varianteService.actualizar(editingId, payload);
        toast.success('Variante actualizada con éxito');
      } else {
        if (!form.productoId) {
          throw new Error('Selecciona un producto');
        }
        const bulkPayload = {
          productoId: Number(form.productoId),
          variantes: (form.variantes || []).map((v) => ({
            color: v.color.trim(),
            stock: Number(v.stock),
            imagenes: v.imagenes
              ? v.imagenes
                  .split(',')
                  .map((val) => val.trim())
                  .filter(Boolean)
              : [],
            ...(v.opcionComboNombre ? { opcionComboNombre: v.opcionComboNombre } : {}),
          })),
        };
        await varianteService.crearMasivo(bulkPayload);
        toast.success('Variante(s) creada(s) con éxito');
      }

      closeModal();
      await load(1, filterProductId);
      setPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar la variante.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAndContinue = async () => {
    setSaving(true);
    try {
      if (!form.productoId) {
        throw new Error('Selecciona un producto');
      }
      const bulkPayload = {
        productoId: Number(form.productoId),
        variantes: (form.variantes || []).map((v) => ({
          color: v.color.trim(),
          stock: Number(v.stock),
          imagenes: v.imagenes
            ? v.imagenes
                .split(',')
                .map((val) => val.trim())
                .filter(Boolean)
            : [],
          ...(v.opcionComboNombre ? { opcionComboNombre: v.opcionComboNombre } : {}),
        })),
      };
      await varianteService.crearMasivo(bulkPayload);
      toast.success('Variante(s) creada(s) con éxito');

      // Keep the same product selected, reset everything else
      const keepProductId = form.productoId;
      setForm({ ...emptyForm(true), productoId: keepProductId });

      await load(1, filterProductId);
      setPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar la variante.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    toast.warning('¿Eliminar esta variante?', {
      description: 'Esta acción no se puede deshacer.',
      duration: Infinity,
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setSaving(true);
          try {
            await varianteService.eliminar(id);
            toast.success('Variante eliminada');
            await load(page, filterProductId);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'No pudimos eliminar la variante.');
          } finally {
            setSaving(false);
          }
        },
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {},
      },
    });
  };

  const handleAdjustStock = async (id: number, currentStock: number, delta: number) => {
    try {
      const newStock = currentStock + delta;
      await varianteService.ajustarStock(id, delta);
      
      const item = items.find((i) => i.id === id);
      if (item && !item.activo && newStock > 0) {
        await varianteService.actualizar(id, { activo: true });
        toast.info('La variante se ha activado automáticamente al tener stock.');
      }

      toast.success(`Stock actualizado de ${currentStock} a ${newStock}`);
      await load(page, filterProductId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos actualizar el stock.');
    }
  };

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    try {
      await varianteService.actualizar(id, { activo: !currentActive });
      toast.success(`Variante ${!currentActive ? 'activada' : 'desactivada'}`);
      await load(page, filterProductId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos cambiar el estado de la variante.');
    }
  };

  const sharedModalProps = {
    isOpen: isModalOpen,
    form,
    products,
    isLoading: saving,
    onClose: closeModal,
    onSubmit: handleSubmit,
    onChange: (value: Partial<VarianteForm>) => setForm((prev) => ({ ...prev, ...value })),
  };

  const createModalProps = {
    ...sharedModalProps,
    onSubmitAndContinue: handleSubmitAndContinue,
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.glassCard}>
        <div className={styles.tableHeaderArea}>
          <h2>Variantes ({meta.total})</h2>
          <button type="button" onClick={openCreate} className={styles.primaryPillBtn}>
            <Plus size={16} /> NUEVA VARIANTE
          </button>
        </div>

        <div className={styles.tableSearchRow} style={{ marginBottom: '1rem' }}>
          <div className={styles.tableSearchBox}>
            <Filter size={14} className={styles.topbarSearchIcon} />
            <select
              className={styles.topbarSearchInput}
              value={filterProductId}
              onChange={(e) => {
                setFilterProductId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todas las variantes</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nombre}
                </option>
              ))}
            </select>
          </div>
          <span style={{ color: '#7d6b73' }}>{selectedProductName}</span>
        </div>

        <VariantesTable
          items={items}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          onAdjustStock={handleAdjustStock}
          onToggleStatus={handleToggleStatus}
        />

        <PaginationControls
          page={meta.page}
          totalPages={meta.totalPages}
          hasPrev={meta.hasPrev}
          hasNext={meta.hasNext}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
        />
      </motion.div>

      {editingId === null ? (
        <VarianteCreateModal {...createModalProps} />
      ) : (
        <VarianteEditModal {...sharedModalProps} editingId={editingId} />
      )}
    </>
  );
};
