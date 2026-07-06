import { useEffect, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import styles from '../../panel/css/Admin.module.css';
import { PaginationControls } from '../../../../shared/components/PaginationControls';
import { categoriaService } from '../../categoria/services/categoriaService';
import { productoService } from '../services/productoService';
import type { CategoriaApiItem } from '../../categoria/types';
import type { ProductoApiItem, ProductoForm } from '../types';
import { useAdminPanel } from '../../panel/context/AdminPanelContext';
import { ProductoCreateModal } from '../components/ProductoCreateModal';
import { ProductosTable } from '../components/ProductosTable';
import { ProductoEditModal } from '../components/ProductoEditModal';

const EMPTY_FORM = (): ProductoForm => ({
  nombre: '',
  slug: '',
  descripcion: '',
  precio: '',
  precioOriginal: '',
  categoriaId: '',
  activo: true,
});

const DEFAULT_META = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

export const ProductosPage = () => {
  const { pendingNewProduct, setPendingNewProduct } = useAdminPanel();

  const [items, setItems] = useState<ProductoApiItem[]>([]);
  const [categories, setCategories] = useState<CategoriaApiItem[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductoForm>(EMPTY_FORM());
  const [errors, setErrors] = useState<Partial<Record<keyof ProductoForm, string>>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadCategories = async () => {
    const response = await categoriaService.listar(1, 100);
    setCategories(response.data);
  };

  const load = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await productoService.listar(currentPage, 10);
      setItems(response.data);
      setMeta(response.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void load(page);
  }, [page]);

  useEffect(() => {
    if (!pendingNewProduct) return;
    openCreate();
    setPendingNewProduct(false);
  }, [pendingNewProduct, setPendingNewProduct]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM());
    setErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (item: ProductoApiItem) => {
    setEditingId(item.id);
    setForm({
      nombre: item.nombre,
      slug: item.slug,
      descripcion: item.descripcion ?? '',
      precio: String(Number(item.precio)),
      precioOriginal: item.precioOriginal ? String(Number(item.precioOriginal)) : '',
      categoriaId: String(item.categoriaId),
      activo: item.activo,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM());
    setErrors({});
  };

  const handleChange = (value: Partial<ProductoForm>) => {
    setForm((prev) => ({ ...prev, ...value }));
    setErrors((prev) => {
      const next = { ...prev };
      (Object.keys(value) as Array<keyof ProductoForm>).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  };

  const validateForm = (currentForm: ProductoForm) => {
    const nextErrors: Partial<Record<keyof ProductoForm, string>> = {};

    if (!currentForm.nombre.trim()) nextErrors.nombre = 'El nombre es obligatorio.';
    if (!currentForm.slug.trim()) nextErrors.slug = 'El slug es obligatorio.';
    if (!currentForm.precio || Number(currentForm.precio) <= 0) {
      nextErrors.precio = 'Ingresa un precio mayor a cero.';
    }
    if (!currentForm.categoriaId) {
      nextErrors.categoriaId = 'Selecciona una categoría.';
    }

    const precioNum = Number(currentForm.precio);
    const precioOriginalNum = currentForm.precioOriginal ? Number(currentForm.precioOriginal) : null;
    if (precioOriginalNum !== null && precioOriginalNum <= precioNum) {
      nextErrors.precioOriginal = 'El precio anterior debe ser mayor al precio actual.';
    }

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
        nombre: form.nombre.trim(),
        slug: form.slug.trim(),
        descripcion: form.descripcion.trim() || undefined,
        precio: Number(form.precio),
        precioOriginal: form.precioOriginal ? Number(form.precioOriginal) : null,
        categoriaId: Number(form.categoriaId),
        activo: form.activo,
      };

      await (editingId
        ? productoService.actualizar(editingId, payload)
        : productoService.crear(payload));

      toast.success(editingId ? 'Producto actualizado con exito' : 'Producto creado con exito');
      closeModal();
      setPage(1);
      await load(1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    toast.warning('¿Eliminar este producto?', {
      description: 'Esta accion no se puede deshacer.',
      duration: Infinity,
      action: {
        label: 'Eliminar',
        onClick: async () => {
          setSaving(true);
          try {
            await productoService.eliminar(id);
            toast.success('Producto eliminado');
            await load(page);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'No pudimos eliminar el producto.');
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

  const handleToggleStatus = async (id: number, currentActive: boolean) => {
    try {
      await productoService.actualizar(id, { activo: !currentActive });
      toast.success(`Producto ${!currentActive ? 'activado' : 'desactivado'}`);
      await load(page);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos cambiar el estado del producto.');
    }
  };

  const sharedModalProps = {
    isOpen: isModalOpen,
    productForm: form,
    categories,
    errors,
    isLoading: saving,
    onClose: closeModal,
    onSubmit: handleSubmit,
    onChange: handleChange,
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.glassCard}>
        <div className={styles.tableHeaderArea}>
          <h2>Productos ({meta.total})</h2>
          <button type="button" onClick={openCreate} className={styles.primaryPillBtn}>
            <Plus size={16} /> NUEVO PRODUCTO
          </button>
        </div>

        <ProductosTable
          items={items}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        <PaginationControls
          page={meta.page}
          totalPages={meta.totalPages}
          hasPrev={meta.hasPrev}
          hasNext={meta.hasNext}
          onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
          onPage={(p) => setPage(p)}
        />
      </motion.div>

      {editingId === null
        ? <ProductoCreateModal {...sharedModalProps} />
        : <ProductoEditModal {...sharedModalProps} editingId={editingId} />
      }
    </>
  );
};
