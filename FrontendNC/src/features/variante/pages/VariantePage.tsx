import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Filter, Plus } from 'lucide-react';
import { toast } from 'sonner';
import styles from '../../panel/css/Admin.module.css';
import { BulkActionBar } from '../../../../shared/components/BulkActionBar';
import { ConfirmDeleteModal } from '../../../../shared/components/ConfirmDeleteModal';
import { PaginationControls } from '../../../../shared/components/PaginationControls';
import { useDeleteConfirm } from '../../../../shared/hooks/useDeleteConfirm';
import { useTableSelection } from '../../../../shared/hooks/useTableSelection';
import { deleteMany } from '../../../../shared/utils/deleteMany';
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
      stock: '1',
      imagenes: '',
      variantes: [{ color: '', stock: '1', imagenes: '' }],
    };
  }
  return {
    productoId: '',
    color: '',
    stock: '1',
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'single'; id: number } | { type: 'bulk'; ids: number[] } | null>(null);

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

  useEffect(() => {
    setSelectedIds(new Set());
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
      // Validar que el stock sea mayor a 0 y color no esté vacío
      if (editingId) {
        if (!form.color.trim()) {
          throw new Error('El color no puede estar vacío');
        }
        if (Number(form.stock) < 1) {
          throw new Error('El stock debe ser mayor a 0');
        }
        
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

        // Validar todas las variantes
        for (const v of form.variantes || []) {
          if (!v.color.trim()) {
            throw new Error('El color no puede estar vacío para todas las variantes');
          }
          if (Number(v.stock) < 1) {
            throw new Error('El stock debe ser mayor a 0 para todas las variantes');
          }
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

      // Validar todas las variantes
      for (const v of form.variantes || []) {
        if (!v.color.trim()) {
          throw new Error('El color no puede estar vacío para todas las variantes');
        }
        if (Number(v.stock) < 1) {
          throw new Error('El stock debe ser mayor a 0 para todas las variantes');
        }
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
    setDeleteTarget({ type: 'single', id });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteTarget({ type: 'bulk', ids: Array.from(selectedIds) });
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allOnPage = items.map((item) => item.id);
      const allSelected = allOnPage.length > 0 && allOnPage.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(allOnPage);
    });
  };

  const closeDeleteModal = () => {
    if (!saving) setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    try {
      if (deleteTarget.type === 'single') {
        await varianteService.eliminar(deleteTarget.id);
        toast.success('Variante eliminada');
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteTarget.id);
          return next;
        });
      } else {
        const results = await Promise.allSettled(
          deleteTarget.ids.map((id) => varianteService.eliminar(id))
        );
        const failed = results.filter((r) => r.status === 'rejected').length;
        const succeeded = results.length - failed;

        if (succeeded > 0) {
          toast.success(`${succeeded} variante${succeeded > 1 ? 's' : ''} eliminada${succeeded > 1 ? 's' : ''}`);
        }
        if (failed > 0) {
          toast.error(`No se pudieron eliminar ${failed} variante${failed > 1 ? 's' : ''}`);
        }
        setSelectedIds(new Set());
      }

      setDeleteTarget(null);
      await load(page, filterProductId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos eliminar la variante.');
    } finally {
      setSaving(false);
    }
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

        {selectedIds.size > 0 && (
          <div className={styles.bulkActionBar}>
            <span>
              {selectedIds.size} variante{selectedIds.size > 1 ? 's' : ''} seleccionada{selectedIds.size > 1 ? 's' : ''}
            </span>
            <button type="button" onClick={handleBulkDelete} disabled={saving} className={styles.bulkDeleteBtn}>
              <Trash2 size={14} />
              Eliminar seleccionadas
            </button>
          </div>
        )}

        <VariantesTable
          items={items}
          loading={loading}
          isSelected={(id) => selectedIds.has(id)}
          allSelected={items.length > 0 && items.every((i) => selectedIds.has(i.id))}
          someSelected={items.some((i) => selectedIds.has(i.id))}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
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

      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        title={
          deleteTarget?.type === 'bulk'
            ? `¿Eliminar ${deleteTarget.ids.length} variantes?`
            : '¿Eliminar esta variante?'
        }
        description="Esta acción no se puede deshacer."
        isLoading={saving}
        onConfirm={() => void confirmDelete()}
        onCancel={closeDeleteModal}
      />
    </>
  );
};
