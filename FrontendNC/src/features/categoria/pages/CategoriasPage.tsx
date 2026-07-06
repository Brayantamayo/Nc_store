import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import styles from '../../panel/css/Admin.module.css';
import { PaginationControls } from '../../../../shared/components/PaginationControls';
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
  const [items, setItems] = useState<CategoriaApiItem[]>([]);
  const [treeItems, setTreeItems] = useState<CategoriaTreeItem[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CategoriaForm>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof CategoriaForm, string>>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    void load(page);
  }, [page]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (item: CategoriaApiItem) => {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre,
      slug: item.slug,
      imagen: item.imagen ?? '',
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
      (Object.keys(value) as Array<keyof CategoriaForm>).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const validateForm = (currentForm: CategoriaForm) => {
    const nextErrors: Partial<Record<keyof CategoriaForm, string>> = {};

    if (!currentForm.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.';
    if (!currentForm.slug.trim()) nextErrors.slug = 'El slug es obligatorio.';

    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Revisa los campos resaltados.', {
        description: Object.values(nextErrors).join(' '),
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        parentId: form.parentId ? Number(form.parentId) : undefined,
      };

      if (editingId) {
        await categoriaService.actualizar(editingId, payload);
        toast.success('Categoria actualizada con exito');
      } else {
        await categoriaService.crear(payload);
        toast.success('Categoria creada con exito');
      }
      closeModal();
      await load(1);
      setPage(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar la categoria.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    toast.warning('¿Eliminar esta categoria?', {
      description: 'Esta accion no se puede deshacer.',
      duration: Infinity,
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setSaving(true);
          try {
            await categoriaService.eliminar(id);
            toast.success('Categoria eliminada');
            await load(page);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'No pudimos eliminar la categoria.');
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

  const sharedModalProps = {
    isOpen: isModalOpen,
    form,
    errors,
    isLoading: saving,
    onClose: closeModal,
    onSubmit: handleSubmit,
    onChange: handleChange,
    categories: treeItems.filter((category) => !category.parentId && category.id !== editingId),
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.glassCard}>
        <div className={styles.tableHeaderArea}>
          <h2>Categorias ({meta.total})</h2>
          <button type="button" onClick={openCreate} className={styles.primaryPillBtn}>
            <Plus size={16} /> NUEVA CATEGORIA
          </button>
        </div>

        <CategoriasTable items={items} loading={loading} onEdit={openEdit} onDelete={handleDelete} />

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
    </>
  );
};
