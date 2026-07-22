// 1. Librerías
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 2. Datos / Tipos
import { categoriaService } from '../../categoria/services/categoriaService';
import { productoService } from '../../productos/services/productoService';
import type { CategoriaTreeItem } from '../../categoria/types';
import type { ProductoApiItem } from '../../productos/types';
import { BRAND_PLACEHOLDER_IMAGE } from '../../../types';
import type { Product } from '../../../types';

// 3. Componentes
import { HeroSection } from '../components/HeroSection';
import { MarqueeTicker } from '../components/TiketMovimiento';
import { ProductCard } from '../../store/Components/ProductCard';
import { ReelsSection } from '../components/Reelssection';
import { Bow } from '../components/Moñito';

// 4. Estilos
import styles from '../css/Home.module.css';
import collectionStyles from '../css/NuevasColecions.module.css';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';

const FALLBACK_COLLECTIONS = [
  { name: 'Tote', image: BRAND_PLACEHOLDER_IMAGE },
  { name: 'Mini Bags', image: BRAND_PLACEHOLDER_IMAGE },
  { name: 'Noche', image: BRAND_PLACEHOLDER_IMAGE },
  { name: 'Crossbody', image: BRAND_PLACEHOLDER_IMAGE },
];

export const Home = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoriaTreeItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar categorías
        const catRes = await categoriaService.arbol();
        setCategories(catRes);

        // Cargar productos (SOLO ACTIVOS)
        const prodRes = await productoService.listarParaTienda(1, 50);
        
        // Transformar productos a formato Product
        const transformedProducts: Product[] = (prodRes.data as ProductoApiItem[])
          .map((p) => {
            const variantes = p.variantes?.filter(v => 'activo' in v ? v.activo : true) || [];
            const variantImages = variantes.flatMap((v) => v.imagenes) || [];
            const images = p.imagenPrincipal
              ? [p.imagenPrincipal, ...variantImages]
              : variantImages.length > 0
                ? variantImages
                : [BRAND_PLACEHOLDER_IMAGE];

            const colors = variantes
              ?.filter((v): v is typeof v & { color: string } => 'color' in v && !!v.color)
              .map((v) => ({
                name: v.color,
                hex: '#db2777',
              })) || [];

            return {
              id: String(p.id),
              slug: p.slug,
              name: p.nombre,
              price: Number(p.precio),
              originalPrice: p.precioOriginal ? Number(p.precioOriginal) : undefined,
              images,
              category: p.categoria?.slug?.toLowerCase() as any || 'general',
              colors,
              material: '',
              description: p.descripcion || '',
              isNew: false,
              isSoldOut: variantes.length === 0 || !variantes.some(v => (v as any).stock > 0),
              isFeatured: false,
              tags: [],
            };
          })
          .filter((p) => !p.isSoldOut);
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error loading home data:', error);
        setCategories([]);
        setProducts([]);
      } finally {
        setCategoriesLoading(false);
        setProductsLoading(false);
      }
    };
    loadData();
  }, []);

  const [isHovered, setIsHovered] = useState(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollOneCard = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const track = trackRef.current;
      const slides = track.getElementsByClassName(styles.carouselSlide);
      if (slides.length > 0) {
        const slideWidth = (slides[0] as HTMLElement).offsetWidth;
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap || style.columnGap) || 32; // fallback to 2rem (32px)
        const scrollAmount = slideWidth + gap;

        const halfWidth = track.scrollWidth / 2;

        if (direction === 'right') {
          // Si estamos cerca de la mitad (el final del primer grupo de productos),
          // restamos la mitad del ancho total instantáneamente para que el scroll suave siga de largo.
          if (track.scrollLeft >= halfWidth - 10) {
            track.scrollLeft = track.scrollLeft - halfWidth;
          }
          track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        } else {
          // Si estamos al inicio y vamos a la izquierda, saltamos a la mitad correspondiente
          if (track.scrollLeft <= 10) {
            track.scrollLeft = track.scrollLeft + halfWidth;
          }
          track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (isHovered) return;
    autoPlayTimerRef.current = setInterval(() => {
      scrollOneCard('right');
    }, 7000);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      startAutoPlay();
    }
    return () => stopAutoPlay();
  }, [products, isHovered]);

  // Use categories from DB, fallback to defaults
  const collections = categories.length > 0 
    ? categories.map(cat => ({
        name: cat.nombre,
        slug: cat.slug,
        image: cat.imagen || BRAND_PLACEHOLDER_IMAGE,
        hasChildren: cat.children.length > 0,
      }))
    : FALLBACK_COLLECTIONS.map(col => ({
        name: col.name,
        slug: col.name.toLowerCase(),
        image: col.image,
        hasChildren: false,
      }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className={styles.home}
    >
      <HeroSection />

      <MarqueeTicker />


      {/* Lista de los bolsos abajo del hero sectionRecién llegado Slider */}
      <section className="section container">
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <Bow size={24} className={styles.headerBow} />
            <h2 className={styles.sectionTitle}>
              Recién <span className={styles.cursive}>llegado</span>
            </h2>
          </div>
          <Link to="/coleccion" className={styles.viewAll}>VER TODO EL ENCANTO</Link>
        </div>

        <div 
          className={styles.carouselContainer}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button 
            className={`${styles.navBtn} ${styles.navBtnLeft}`} 
            onClick={() => {
              scrollOneCard('left');
              startAutoPlay();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.carouselTrack} ref={trackRef}>
            {[...products, ...products].map((product, index) => (
              <div key={`${product.id}-${index}`} className={styles.carouselSlide}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>

          <button 
            className={`${styles.navBtn} ${styles.navBtnRight}`} 
            onClick={() => {
              scrollOneCard('right');
              startAutoPlay();
            }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </section>
  {/* NUEVAS COLECCIONES */}



  {/* Nuevas Colecciones — cinta infinita */}
<section className={collectionStyles.collectionsSection}>
  <div className="container">
    <div className={collectionStyles.collectionsHeader}>
      <div className={collectionStyles.eyebrow}>
        <span className={collectionStyles.eyebrowLine} />
        <span className={collectionStyles.eyebrowText}>✦ Temporada 2025 ✦</span>
        <span className={collectionStyles.eyebrowLine} />
      </div>
      <h2 className={collectionStyles.collectionsTitle}>
        Nuevas <em className={collectionStyles.cursive}>Colecciones</em>
      </h2>
      <p className={collectionStyles.collectionsSub}>
        Piezas exclusivas que mezclan artesanía y diseño contemporáneo
      </p>
    </div>
  </div>

  {/* cinta fuera del container para que llegue al borde */}
  <div className={collectionStyles.beltWrapper}>
    <div className={collectionStyles.beltTrack}>
      {/* duplicamos para el loop infinito */}
      {[...collections, ...collections].map((col, idx) => (
          <Link
          key={idx}
          to={`/coleccion?category=${col.slug || col.name.toLowerCase()}`}
          className={`${collectionStyles.lookbookCard} ${idx % collections.length === 0 ? collectionStyles.lookbookHero : ''}`}
        >
          <div className={collectionStyles.lookbookImgWrap}>
            <img
              src={`${col.image}?auto=format&fit=crop&q=80&w=800`}
              alt={col.name}
              className={collectionStyles.lookbookImg}
            />
          </div>
          <div className={collectionStyles.lookbookOverlay} />
          <div className={collectionStyles.lookbookLabel}>
            <span className={collectionStyles.lookbookNum}>0{(idx % collections.length) + 1}</span>
            <span className={collectionStyles.lookbookName}>{col.name}</span>
            <span className={collectionStyles.lookbookCta}>
              Ver piezas <Bow size={9} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>

  <div className="container">
    <div className={collectionStyles.collectionsFooter}>
      <Link to="/coleccion" className={collectionStyles.allCollectionsBtn}>
        Ver todas las colecciones
      </Link>
    </div>
  </div>
</section>
    {/* Instagram */}
    <ReelsSection />

    {/* Floating WhatsApp Support Button */}
      <a 
        href="https://wa.me/573226865883" 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.whatsappFloat}
      >
        <div className={styles.whatsappIconWrapper}>
          <MessageCircle size={22} fill="currentColor" />
        </div>
        <div className={styles.whatsappText}>
          <span className={styles.whatsappTitle}>Línea de</span>
          <span className={styles.whatsappSubtitle}>atención</span>
        </div>
      </a>

    </motion.div>
  );
};
