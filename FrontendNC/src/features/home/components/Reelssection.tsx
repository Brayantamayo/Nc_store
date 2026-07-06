import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Camera,
  Grid2X2,
  Instagram,
  Sparkles,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
} from 'lucide-react';
import { Bow } from './Moñito';
import { galeriaService, type GaleriaImage } from '../../galeria/services/galeriaService';
import styles from '../css/ReelsSection.module.css';

export const ReelsSection = () => {
  const [images, setImages] = useState<GaleriaImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const data = await galeriaService.listar();
        setImages(data);
      } catch (error) {
        console.error('Error loading gallery:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    void loadGallery();
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Bow size={24} className={styles.bow} />
          <h2 className={styles.title}>
            Siguenos en <span className={styles.cursive}>Instagram</span>
          </h2>
          <p className={styles.subtitle}>El mundo NC en cada publicacion</p>
          <a
            href="https://instagram.com/ncstore"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.igHandle}
          >
            @ncstore
          </a>
        </div>

        {loading ? (
          <div className={styles.loadingState} aria-busy="true" aria-live="polite">
            <div className={styles.loadingCopy}>
              <Grid2X2 size={22} />
              <span>Cargando la galeria curada de NC...</span>
            </div>
            <div className={styles.loadingGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className={styles.loadingTile} />
              ))}
            </div>
          </div>
        ) : images.length === 0 ? (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className={styles.emptyIconWrap}>
              <Instagram size={28} />
            </div>
            <p className={styles.emptyKicker}>
              <Sparkles size={14} />
              Curating moments
            </p>
            <h3 className={styles.emptyTitle}>Pronto veras aqui las piezas mas hermosas de NC</h3>
            <p className={styles.emptyText}>
              Sube hasta 9 imagenes desde el panel para convertir este espacio en un escaparate editorial con estilo Instagram.
            </p>
            <div className={styles.emptyActions}>
              <a
                href="https://instagram.com/ncstore"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.emptyPrimaryAction}
              >
                <Camera size={16} />
                Ver Instagram
              </a>
              <div className={styles.emptyMeta}>
                <span>Hasta 9 imagenes</span>
                <span>Vista premium</span>
              </div>
            </div>
            <div className={styles.emptyPreviewGrid} aria-hidden="true">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={styles.emptyPreviewTile}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <ArrowRight size={12} />
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className={styles.postsGrid}>
            {images.slice(0, 9).map((image, index) => (
              <motion.a
                key={image.id}
                href={image.url}
                target="_blank"
                rel="noreferrer"
                className={styles.postCard}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
              >
                <div className={styles.postHeader}>
                  <div className={styles.postAvatarWrap}>
                    <span className={styles.postAvatarText}>NC</span>
                  </div>
                  <div className={styles.postUserInfo}>
                    <span className={styles.postUsername}>ncstore.co</span>
                    <span className={styles.postLocation}>Medellín, Colombia</span>
                  </div>
                  <div className={styles.postMore}>
                    <MoreHorizontal size={20} />
                  </div>
                </div>

                <div className={styles.postImageWrapper}>
                  <img src={image.url} alt={image.caption || `Galeria NC ${index + 1}`} className={styles.postImage} />
                </div>

                <div className={styles.postFooter}>
                  <div className={styles.postActionBar}>
                    <div className={styles.postActionGroup}>
                      <Heart size={22} />
                      <MessageCircle size={22} />
                      <Send size={22} />
                    </div>
                    <Bookmark size={22} />
                  </div>
                  <div className={styles.postLikes}>
                    Les gusta a <strong>ncstore</strong> y <strong>miles de personas más</strong>
                  </div>
                  {image.caption ? (
                    <div className={styles.postCaption}>
                      <strong>ncstore.co</strong> {image.caption}
                    </div>
                  ) : null}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
