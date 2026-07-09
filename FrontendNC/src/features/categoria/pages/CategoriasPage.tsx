import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import styles from '../../panel/css/Admin.module.css';
import { PaginationControls } from '../../../../shared/components/PaginationControls';
import { BulkActionBar } from '../../../../shared/components/BulkActionBar';
import { ConfirmDeleteModal } from '../../../../shared/components/ConfirmDeleteModal';
import { useDeleteConfirm } from '../../../../shared/hooks/useDeleteConfirm';
import { useTableSelection } from '../../../../shared/hooks/useTableSelection';
import { categoriaService } from '../services/categoriaService';
import type { CategoriaApiItem, CategoriaForm, CategoriaTreeItem } from '../types';
import { CategoriasTable } from '../components/CategoriasTable';
import { CategoriaCreateModal } from '../components/CategoriaCreateModal';
import { CategoriaEditModal } from '../components/CategoriaEditModal';

const emptyForm = (): CategoriaForm => ({
  nombre: '',
  slug: '',
  imagen: '',
  parentId: '',
});

export const CategoriasPage = () => {
  const [items, setItems]         = useState<CategoriaApiItem[]>([]);
  const [treeItems, setTreeItems] = useState<CategoriaTreeItem[]>([]);
  const [page, setPage]           = useState(1);
  const [meta, setMeta]           = useState({ page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState<CategoriaForm>(emptyForm());
  const [errors, setErrors]       = useState<Partial<Record<keyof CategoriaForm, string>>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Selección y confirmación de eliminación ──────────────────────────────
  const itemIds = items.map((i) => i.id);

  const {
    selectedIds, count: selectedCount,
    toggle, toggleAll, clear,
  } = useTableSelection(itemIds, [page]);

  const {
    isDeleteOpen, modalTitle, modalDescription,
    requestDelete, requestBulkDelete, closeDelete, deleteTarget,
  } = useDeleteConfirm<number>({
    singleTitle: '¿Eliminar esta categoría?',
    bulkTitle: (n) => `¿Eliminar ${n} categorías?`,
    description: 'Esta acción no se puede deshacer. Las categorías con productos asociados no se pueden eliminar.',
  });

  // ── Carga ────────────────────────────────────────────────────────────────
  const load = async (currentPage = page) => {
    setLoading(true);
    try {
      const [response, treeResponse] = await Promise.all([
        categoriaService.listar(currentPage, 10),
        categoriaService.arbol(),
      ]);
      setItems(response.data);
      setTreeItems(treeResponse);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(page); }, [page]);

  // ── Modal ────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (item: CategoriaApiItem) => {
    setEditingId(item.id);
    setForm({
      nombre:   item.nombre,
      slug:     item.slug,
      imagen:   item.imagen ?? '',
      parentId: item.parentId ? String(item.parentId) : '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
  };

  const handleChange = (value: Partial<CategoriaForm>) => {
    setForm((prev) => ({ ...prev, ...value }));
    setErrors((prev) => {
      const next = { ...prev };
      (Object.keys(value) as Array<keyof CategoriaForm>).forEach((key) => { delete next[key]; });
      return next;
    });
  };

  const validateForm = (currentForm: CategoriaForm) => {
    const nextErrors: Partial<Record<keyof CategoriaForm, string>> = {};
    if (!currentForm.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.';
    if (!currentForm.slug.trim())   nextErrors.slug   = 'El slug es obligatorio.';
    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Revisa los campos resaltados.', { description: Object.values(nextErrors).join(' ') });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, parentId: form.parentId ? Number(form.parentId) : undefined };
      if (editingId) {
        await categoriaService.actualizar(editingId, payload);
        toast.success('Categoría actualizada con éxito');
      } else {
        await categoriaService.crear(payload);
        toast.success('Categoría creada con éxito');
      }
      closeModal();
      await load(1);
      setPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = (id: number) => requestDelete(id);

  const handleBulkDelete = () => requestBulkDelete(Array.from(selectedIds));

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (deleteTarget.type === 'single') {
        await categoriaService.eliminar(deleteTarget.id);
        toast.success('Categoría eliminada');
      } else {
        const results = await Promise.allSettled(
          deleteTarget.ids.map((id) => categoriaService.eliminar(id))
        );
        const failed    = results.filter((r) => r.status === 'rejected').length;
        const succeeded = results.length - failed;
        if (succeeded > 0) toast.success(`${succeeded} categoría${succeeded > 1 ? 's' : ''} eliminada${succeeded > 1 ? 's' : ''}`);
        if (failed > 0)    toast.error(`No se pudieron eliminar ${failed} categoría${failed > 1 ? 's' : ''}`);
        clear();
      }
      closeDelete();
      await load(page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos eliminar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const sharedModalProps = {
    isOpen: isModalOpen,
    form,
    errors,
    isLoading: saving,
    onClose: closeModal,
    onSubmit: handleSubmit,
    onChange: handleChange,
    categories: treeItems.filter((c) => !c.parentId && c.id !== editingId),
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.glassCard}>
        <div className={styles.tableHeaderArea}>
          <h2>Categorías ({meta.total})</h2>
          <button type="button" onClick={openCreate} className={styles.primaryPillBtn}>
            <Plus size={16} /> NUEVA CATEGORÍA
          </button>
        </div>

        <BulkActionBar
          count={selectedCount}
          entityLabel="categoría"
          entityLabelPlural="categorías"
          onDelete={handleBulkDelete}
          disabled={saving}
        />

        <CategoriasTable
          items={items}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={toggle}
          onToggleSelectAll={toggleAll}
          onEdit={openEdit}
          onDelete={handleDelete}
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
        <CategoriaCreateModal {...sharedModalProps} />
      ) : (
        <CategoriaEditModal {...sharedModalProps} editingId={editingId} />
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title={modalTitle}
        description={modalDescription}
        isLoading={saving}
        onConfirm={() => void confirmDelete()}
        onCancel={closeDelete}
      />
    </>
  );
};
