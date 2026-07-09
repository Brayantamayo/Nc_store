import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, ImagePlus, Check, X, Images } from 'lucide-react';
import { toast } from 'sonner';
import { galeriaService, type GaleriaImage } from '../services/galeriaService';
import { useAdminPanel } from '../../panel/context/AdminPanelContext';
import { ConfirmDeleteModal } from '../../../../shared/components/ConfirmDeleteModal';
import { useDeleteConfirm } from '../../../../shared/hooks/useDeleteConfirm';
import styles from '../../panel/css/Admin.module.css';

const MAX_IMAGES = 9;

export const GaleriaPage = () => {
  const { setIsLoading, isLoading } = useAdminPanel();

  const [images, setImages]         = useState<GaleriaImage[]>([]);
  const [modalOpen, setModalOpen]   = useState(false);
  const [file, setFile]             = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [caption, setCaption]       = useState('');
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const {
    isDeleteOpen, modalTitle, modalDescription,
    requestDelete, closeDelete, deleteTarget,
  } = useDeleteConfirm<number>({
    singleTitle: '¿Eliminar esta imagen?',
    bulkTitle: () => '',
    description: 'Esta acción no se puede deshacer.',
  });

  const remaining    = Math.max(0, MAX_IMAGES - images.length);
  const orderedImages = useMemo(() => [...images].sort((a, b) => a.orden - b.orden), [images]);

  // ── Carga inicial ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setImages(await galeriaService.listar());
      } catch {
        toast.error('No pudimos cargar la galería.');
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
    setCaption('');
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    e.target.value = '';
  };

  // ── Subir imagen ─────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file)           { toast.error('Selecciona una imagen primero.'); return; }
    if (!caption.trim()) { toast.error('Escribe una descripción para la imagen.'); return; }

    setIsLoading(true);
    try {
      const created = await galeriaService.subir(file, caption.trim());
      setImages((prev) => [...prev, created]);
      toast.success('Imagen añadida a la galería.');
      closeModal();
    } catch {
      toast.error('No pudimos subir la imagen.');
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
      await galeriaService.eliminar(deleteTarget.id);
      setImages((prev) => prev.filter((img) => img.id !== deleteTarget.id));
      toast.success('Imagen eliminada.');
      closeDelete();
    } catch {
      toast.error('No pudimos eliminar la imagen.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={styles.adminGalleryShell}
    >
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div className={styles.adminGalleryHeader}>
        <div className={styles.adminGalleryTitleWrap}>
          <h1 className={styles.adminGalleryTitle}>
            Gestión de <span>galería</span>
          </h1>
          <div className={styles.adminGallerySubtitle}>
            Personaliza las imágenes que ven tus clientes en la landing page
            <span className={styles.adminGalleryPill}>
              {orderedImages.length}/{MAX_IMAGES} imágenes
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
          Añadir imagen
        </button>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────── */}
      <div className={styles.adminGalleryGrid}>
        {orderedImages.length > 0 ? (
          orderedImages.map((image, index) => (
            <motion.article
              key={image.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={styles.adminGalleryCard}
            >
              <img src={image.url} alt={`Imagen ${index + 1}`} />
              <div className={styles.adminGalleryOverlay}>
                <span className={styles.adminGalleryImageLabel}>IMAGEN {index + 1}</span>
                {image.caption && (
                  <span className={styles.adminGalleryCaptionBadge}>{image.caption}</span>
                )}
                <div className={styles.adminGalleryActions}>
                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    className={styles.adminGalleryDeleteBtn}
                    aria-label="Eliminar imagen"
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.article>
          ))
        ) : (
          <div className={styles.adminGalleryEmpty}>
            <Images size={32} strokeWidth={1.5} style={{ color: '#e91e8c', opacity: 0.5 }} />
            <p>No hay imágenes todavía.</p>
            <p>Haz clic en <strong>Añadir imagen</strong> para subir la primera.</p>
          </div>
        )}
      </div>

      {/* ── MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
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
              className={styles.galeriaModal}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              role="dialog"
              aria-modal="true"
              aria-label="Añadir imagen a la galería"
            >
              {/* Header */}
              <div className={styles.bannerModalHeader}>
                <div className={styles.bannerModalTitleWrap}>
                  <span className={styles.galeriaModalIconWrap}>
                    <Images size={16} />
                  </span>
                  <div>
                    <h2 className={styles.bannerModalTitle}>Nueva imagen</h2>
                    <p className={styles.bannerModalSub}>Se publicará en la galería de la landing page</p>
                  </div>
                </div>
                <button type="button" className={styles.bannerModalClose} onClick={closeModal} aria-label="Cerrar">
                  <X size={18} />
                </button>
              </div>

              {/* Body: preview + formulario */}
              <div className={styles.galeriaModalBody}>

                {/* Preview de la imagen */}
                <div className={styles.galeriaPreviewWrap}>
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="preview" className={styles.galeriaPreviewImg} />
                      {caption && (
                        <div className={styles.galeriaPreviewCaption}>
                          <span>{caption}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className={styles.galeriaPreviewEmpty}>
                      <ImagePlus size={30} />
                      <span>Elige una imagen para ver la previsualización</span>
                    </div>
                  )}
                  <span className={styles.bannerPreviewLabel}>
                    <Images size={11} />
                    Vista previa
                  </span>
                </div>

                {/* Formulario */}
                <form className={styles.bannerModalForm} onSubmit={handleSubmit} id="galeria-form">

                  {/* Drop zone */}
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
                        <span className={styles.bannerDropZoneHint}>JPG, PNG, WEBP — proporción recomendada 4:5</span>
                      </>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className={styles.bannerModalFields}>
                    <label className={styles.bannerModalField}>
                      <span className={styles.bannerModalLabel}>
                        Descripción <em>*</em>
                        <span className={styles.bannerModalLabelHint}>Máx. 120 caracteres</span>
                      </span>
                      <input
                        className={styles.bannerModalInput}
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Ej: Bolsos de temporada primavera 2025"
                        maxLength={120}
                        autoComplete="off"
                      />
                    </label>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className={styles.bannerModalFooter}>
                <button type="button" className={styles.bannerModalCancel} onClick={closeModal} disabled={isLoading}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="galeria-form"
                  className={styles.bannerModalSubmit}
                  disabled={!file || !caption.trim() || remaining === 0 || isLoading}
                >
                  {isLoading ? 'Subiendo…' : 'Añadir a la galería'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        title={modalTitle}
        description={modalDescription}
        isLoading={isLoading}
        onConfirm={() => void confirmDelete()}
        onCancel={closeDelete}
      />
    </motion.div>
  );
};
