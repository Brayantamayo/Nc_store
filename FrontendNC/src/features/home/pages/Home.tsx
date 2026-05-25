// 1. Librerías
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 2. Datos / Tipos
import { useProductStore } from '../../store/pages/productStore';

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


export const Home = () => {
  const { products } = useProductStore();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollTrack = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const scrollAmount = trackRef.current.offsetWidth * 0.8;
      trackRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const collections = [
    { name: 'Tote', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3' },
    { name: 'Mini Bags', image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e' },
    { name: 'Noche', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa' },
    { name: 'Crossbody', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7' },
  ];

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

        <div className={styles.carouselContainer}>
          <button className={`${styles.navBtn} ${styles.navBtnLeft}`} onClick={() => scrollTrack('left')}>
            <ChevronLeft size={24} />
          </button>
          
          <div className={styles.carouselTrack} ref={trackRef}>
            {products.map((product, index) => (
              <div key={product.id} className={styles.carouselSlide}>
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>

          <button className={`${styles.navBtn} ${styles.navBtnRight}`} onClick={() => scrollTrack('right')}>
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
          to={`/coleccion?category=${col.name.toLowerCase()}`}
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