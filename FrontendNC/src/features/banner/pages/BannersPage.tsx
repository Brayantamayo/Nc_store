///esta pagina es para crear banners para la landing page la foto que esta en la parte de atras de a  pagina 
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Eye, EyeOff, Pencil, X, Check, Plus, ImagePlus, MonitorPlay } from 'lucide-react';
import { toast } from 'sonner';
import { bannerService, type BannerSlide } from '../services/bannerService';
import { useAdminPanel } from '../../panel/context/AdminPanelContext';
import { ConfirmDeleteModal } from '../../../../shared/components/ConfirmDeleteModal';
import { useDeleteConfirm } from '../../../../shared/hooks/useDeleteConfirm';
import { Bow } from '../../home/components/Moñito';
import styles from '../../panel/css/Admin.module.css';

const MAX_BANNERS = 8;

interface DraftForm {
  titulo: string;
  subtitulo: string;
  desc: string;
}

interface EditState {
  id: number;
  titulo: string;
  subtitulo: string;
  desc: string;
}

const emptyDraft = (): DraftForm => ({ titulo: '', subtitulo: '', desc: '' });

/* ─────────────────────────────────────────────────────────────────────────────
   Mini-preview que imita exactamente cómo se verá el slide en la landing page
───────────────────────────────────────────────────────────────────────────── */
const SlidePreview = ({
  imageUrl,
  titulo,
  subtitulo,
  desc,
}: {
  imageUrl: string;
  titulo: string;
  subtitulo: string;
  desc: string;
}) => (
  <div className={styles.bannerPreviewWrap}>
    {/* Imagen de fondo */}
    {imageUrl ? (
      <img src={imageUrl} alt="preview" className={styles.bannerPreviewImg} />
    ) : (
      <div className={styles.bannerPreviewEmpty}>
        <ImagePlus size={28} />
        <span>Elige una imagen para ver la previsualización</span>
      </div>
    )}

    {/* Overlay degradado igual al hero real */}
    {imageUrl && <div className={styles.bannerPreviewOverlay} />}

    {/* Texto superpuesto */}
    {imageUrl && (
      <div className={styles.bannerPreviewContent}>
        <div className={styles.bannerPreviewBadge}>
          <Bow size={10} color="rgba(255,255,255,0.7)" />
          <span>HECHO CON AMOR • EST. 2024</span>
        </div>
        <div className={styles.bannerPreviewTitle}>
          {titulo ? (
            <span className={styles.bannerPreviewCursive}>{titulo}</span>
          ) : (
            <span className={styles.bannerPreviewPlaceholder}>Título del slide</span>
          )}
          {subtitulo ? (
            <span className={styles.bannerPreviewBold}>{subtitulo}</span>
          ) : (
            <span className={styles.bannerPreviewPlaceholderSub}>SUBTÍTULO</span>
          )}
        </div>
        {desc && <p className={styles.bannerPreviewDesc}>{desc}</p>}
        <span className={styles.bannerPreviewCta}>EXPLORAR COLECCIÓN</span>
      </div>
    )}

    {/* Pill de etiqueta */}
    <span className={styles.bannerPreviewLabel}>
      <MonitorPlay size={11} />
      Vista previa
    </span>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────────
   Página principal
───────────────────────────────────────────────────────────────────────────── */
export const BannersPage = () => {
  const { setIsLoading, isLoading } = useAdminPanel();

  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [draft, setDraft] = useState<DraftForm>(emptyDraft());
  const [editState, setEditState] = useState<EditState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const remaining = Math.max(0, MAX_BANNERS - banners.length);
  const ordered = useMemo(() => [...banners].sort((a, b) => a.orden - b.orden), [banners]);

  const {
    isDeleteOpen, modalTitle, modalDescription,
    requestDelete, closeDelete, deleteTarget,
  } = useDeleteConfirm<number>({
    singleTitle: '¿Eliminar este banner?',
    bulkTitle: () => '',
    description: 'Desaparecerá del carrusel de inmediato.',
  });

  // ── Carga inicial ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setBanners(await bannerService.listarTodos());
      } catch {
        toast.error('No pudimos cargar los banners.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [setIsLoading]);

  // ── Cleanup URL ──────────────────────────────────────────────────
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ── Cerrar modal con Escape ──────────────────────────────────────
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen]);

  // ── Helpers ──────────────────────────────────────────────────────
  const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl('');
    setDraft(emptyDraft());
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    e.target.value = '';
  };

  // ── Subir banner ─────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file)                  { toast.error('Selecciona una imagen primero.'); return; }
    if (!draft.titulo.trim())   { toast.error('El título es obligatorio.'); return; }
    if (!draft.subtitulo.trim()) { toast.error('El subtítulo es obligatorio.'); return; }

    setIsLoading(true);
    try {
      const created = await bannerService.subir(file, {
        titulo:    draft.titulo.trim(),
        subtitulo: draft.subtitulo.trim(),
        desc:      draft.desc.trim() || undefined,
      });
      setBanners((prev) => [...prev, created]);
      toast.success('Banner publicado en la landing.');
      closeModal();
    } catch {
      toast.error('No pudimos publicar el banner.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Eliminar ─────────────────────────────────────────────────────
  const handleDelete = (id: number) => requestDelete(id);

  const confirmDelete = async () => {
    if (!deleteTarget || deleteTarget.type !== 'single') return;
    setIsLoading(true);
    try {
      await bannerService.eliminar(deleteTarget.id);
      setBanners((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      toast.success('Banner eliminado.');
      closeDelete();
    } catch {
      toast.error('No pudimos eliminar el banner.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Toggle activo ────────────────────────────────────────────────
  const handleToggleActivo = async (banner: BannerSlide) => {
    setIsLoading(true);
    try {
      const updated = await bannerService.actualizar(banner.id, { activo: !banner.activo });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
      toast.success(updated.activo ? 'Banner activado.' : 'Banner ocultado.');
    } catch {
      toast.error('No pudimos actualizar el banner.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Edición inline ───────────────────────────────────────────────
  const startEdit = (banner: BannerSlide) => {
    setEditState({ id: banner.id, titulo: banner.titulo, subtitulo: banner.subtitulo, desc: banner.desc ?? '' });
  };
  const cancelEdit = () => setEditState(null);

  const saveEdit = async () => {
    if (!editState) return;
    if (!editState.titulo.trim() || !editState.subtitulo.trim()) {
      toast.error('Título y subtítulo son obligatorios.');
      return;
    }
    setIsLoading(true);
    try {
      const updated = await bannerService.actualizar(editState.id, {
        titulo:    editState.titulo.trim(),
        subtitulo: editState.subtitulo.trim(),
        desc:      editState.desc.trim() || undefined,
      });
      setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success('Banner actualizado.');
      setEditState(null);
    } catch {
      toast.error('No pudimos guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.adminGalleryShell}
      >
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div className={styles.adminGalleryHeader}>
        <div className={styles.adminGalleryTitleWrap}>
          <h1 className={styles.adminGalleryTitle}>
            Banners del <span>carrusel</span>
          </h1>
          <div className={styles.adminGallerySubtitle}>
            Gestiona las diapositivas del hero de la landing page
            <span className={styles.adminGalleryPill}>
              {ordered.length}/{MAX_BANNERS} banners
            </span>
          </div>
        </div>

        <button
          type="button"
          className={styles.bannerCreateBtn}
          onClick={openModal}
          disabled={remaining === 0 || isLoading}
        >
          <Plus size={16} />
          Crear banner
        </button>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────── */}
      <div className={styles.adminBannerGrid}>
        <AnimatePresence>
          {ordered.length > 0 ? (
            ordered.map((banner, index) => (
              <motion.article
                key={banner.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${styles.adminBannerCard} ${!banner.activo ? styles.adminBannerCardInactive : ''}`}
              >
                <div className={styles.adminBannerImgWrap}>
                  <img src={banner.url} alt={`Banner ${index + 1}`} />
                  {!banner.activo && (
                    <div className={styles.adminBannerInactiveMask}><span>Inactivo</span></div>
                  )}
                  <span className={styles.adminBannerSlideTag}>SLIDE {index + 1}</span>
                </div>

                {editState?.id === banner.id ? (
                  <div className={styles.adminBannerEditForm}>
                    <input
                      className={styles.adminBannerEditInput}
                      value={editState.titulo}
                      onChange={(e) => setEditState((p) => p && { ...p, titulo: e.target.value })}
                      placeholder="Título"
                      maxLength={80}
                    />
                    <input
                      className={styles.adminBannerEditInput}
                      value={editState.subtitulo}
                      onChange={(e) => setEditState((p) => p && { ...p, subtitulo: e.target.value })}
                      placeholder="Subtítulo"
                      maxLength={80}
                    />
                    <input
                      className={styles.adminBannerEditInput}
                      value={editState.desc}
                      onChange={(e) => setEditState((p) => p && { ...p, desc: e.target.value })}
                      placeholder="Descripción (opcional)"
                      maxLength={160}
                    />
                    <div className={styles.adminBannerEditActions}>
                      <button type="button" className={styles.adminBannerEditSave} onClick={saveEdit} disabled={isLoading}>
                        <Check size={14} /> Guardar
                      </button>
                      <button type="button" className={styles.adminBannerEditCancel} onClick={cancelEdit} disabled={isLoading}>
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.adminBannerCardBody}>
                    <p className={styles.adminBannerTitulo}>{banner.titulo}</p>
                    <p className={styles.adminBannerSubtitulo}>{banner.subtitulo}</p>
                    {banner.desc && <p className={styles.adminBannerDesc}>{banner.desc}</p>}
                  </div>
                )}

                {editState?.id !== banner.id && (
                  <div className={styles.adminBannerCardActions}>
                    <button type="button" className={styles.adminBannerActionBtn} onClick={() => startEdit(banner)} disabled={isLoading} title="Editar texto">
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.adminBannerActionBtn} ${banner.activo ? styles.adminBannerActionActive : styles.adminBannerActionInactive}`}
                      onClick={() => handleToggleActivo(banner)}
                      disabled={isLoading}
                      title={banner.activo ? 'Ocultar' : 'Activar'}
                    >
                      {banner.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button type="button" className={`${styles.adminBannerActionBtn} ${styles.adminBannerActionDelete}`} onClick={() => handleDelete(banner.id)} disabled={isLoading} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </motion.article>
            ))
          ) : (
            <div className={styles.adminBannerEmpty}>
              <MonitorPlay size={32} strokeWidth={1.5} />
              <p>No hay banners todavía.</p>
              <p>Haz clic en <strong>Crear banner</strong> para añadir el primero.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MODAL CREAR ──────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          /* Backdrop actúa como contenedor flex — centra el modal en el área de trabajo */
          <motion.div
            key="backdrop"
            className={styles.bannerModalBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            <motion.div
              key="modal"
              className={styles.bannerModal}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-label="Crear banner"
            >
              {/* Header modal */}
              <div className={styles.bannerModalHeader}>
                <div className={styles.bannerModalTitleWrap}>
                  <span className={styles.bannerModalIconWrap}><MonitorPlay size={16} /></span>
                  <div>
                    <h2 className={styles.bannerModalTitle}>Nuevo banner</h2>
                    <p className={styles.bannerModalSub}>Se publicará en el carrusel de la landing page</p>
                  </div>
                </div>
                <button type="button" className={styles.bannerModalClose} onClick={closeModal} aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>

              {/* Cuerpo: preview + formulario */}
              <div className={styles.bannerModalBody}>

                {/* Preview en tiempo real */}
                <SlidePreview
                  imageUrl={previewUrl}
                  titulo={draft.titulo}
                  subtitulo={draft.subtitulo}
                  desc={draft.desc}
                />

                {/* Formulario */}
                <form className={styles.bannerModalForm} onSubmit={handleSubmit} id="banner-form">

                  {/* Zona de carga de imagen */}
                  <div
                    className={`${styles.bannerDropZone} ${file ? styles.bannerDropZoneActive : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                    {file ? (
                      <>
                        <Check size={18} className={styles.bannerDropZoneCheck} />
                        <span className={styles.bannerDropZoneFileName}>{file.name}</span>
                        <span className={styles.bannerDropZoneChange}>Cambiar imagen</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus size={22} className={styles.bannerDropZoneIcon} />
                        <span className={styles.bannerDropZoneText}>Haz clic para elegir una imagen</span>
                        <span className={styles.bannerDropZoneHint}>JPG, PNG, WEBP — máx. recomendado 2 MB</span>
                      </>
                    )}
                  </div>

                  {/* Campos de texto */}
                  <div className={styles.bannerModalFields}>
                    <label className={styles.bannerModalField}>
                      <span className={styles.bannerModalLabel}>
                        Título <em>*</em>
                        <span className={styles.bannerModalLabelHint}>Texto en cursiva grande</span>
                      </span>
                      <input
                        className={styles.bannerModalInput}
                        type="text"
                        value={draft.titulo}
                        onChange={(e) => setDraft((p) => ({ ...p, titulo: e.target.value }))}
                        placeholder="Ej: Esculpe"
                        maxLength={80}
                        autoComplete="off"
                      />
                    </label>

                    <label className={styles.bannerModalField}>
                      <span className={styles.bannerModalLabel}>
                        Subtítulo <em>*</em>
                        <span className={styles.bannerModalLabelHint}>Texto en mayúsculas bold</span>
                      </span>
                      <input
                        className={styles.bannerModalInput}
                        type="text"
                        value={draft.subtitulo}
                        onChange={(e) => setDraft((p) => ({ ...p, subtitulo: e.target.value }))}
                        placeholder="Ej: Tu Propio Estilo"
                        maxLength={80}
                        autoComplete="off"
                      />
                    </label>

                    <label className={styles.bannerModalField}>
                      <span className={styles.bannerModalLabel}>
                        Descripción
                        <span className={styles.bannerModalLabelHint}>Opcional — frase corta debajo del título</span>
                      </span>
                      <input
                        className={styles.bannerModalInput}
                        type="text"
                        value={draft.desc}
                        onChange={(e) => setDraft((p) => ({ ...p, desc: e.target.value }))}
                        placeholder="Ej: Alta costura desde Medellín."
                        maxLength={160}
                        autoComplete="off"
                      />
                    </label>
                  </div>
                </form>
              </div>

              {/* Footer modal */}
              <div className={styles.bannerModalFooter}>
                <button type="button" className={styles.bannerModalCancel} onClick={closeModal} disabled={isLoading}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="banner-form"
                  className={styles.bannerModalSubmit}
                  disabled={!file || !draft.titulo.trim() || !draft.subtitulo.trim() || isLoading}
                >
                  {isLoading ? 'Publicando…' : 'Publicar banner'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title={modalTitle}
        description={modalDescription}
        isLoading={isLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={closeDelete}
      />
    </>
  );
};