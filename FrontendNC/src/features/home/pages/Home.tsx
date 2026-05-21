// 1. Librerías
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 2. Datos / Tipos
import { MOCK_PRODUCTS } from '../../../mockData';

// 3. Componentes
import { HeroSection } from '../components/HeroSection';
import { MarqueeTicker } from '../components/TiketMovimiento';
import { ProductCard } from '../../store/Components/ProductCard';
import { ReelsSection } from '../components/Reelssection';
import { Bow } from '../components/Moñito';

// 4. Estilos
import styles from '../css/Home.module.css';

export const Home = () => {
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
            {MOCK_PRODUCTS.map((product, index) => (
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
      {/* Lista de los bolsos abajo del hero */}



      {/* Nuestras Colecciones*/}
      <section className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.centeredHeader}>
            <Bow size={30} className={styles.centeredBow} color="var(--color-primary)" />
            <h2 className={styles.sectionTitleCentered}>Nuevas <span className={styles.cursive}>Colecciones</span></h2>
            <p className={styles.sectionSubtitle}>Explora lo mas nuevo y exclusivo de NC a través de nuestro diseños exclusivas.</p>
          </div>
          <div className={styles.categoryGrid}>
            {collections.map((col, idx) => {
              const styleClasses = [
                styles.categoryCardTote,
                styles.categoryCardMini,
                styles.categoryCardNoche,
                styles.categoryCardCrossbody
              ];
              const cardClass = `${styles.categoryCard} ${styleClasses[idx]}`;

              return (
                <Link key={idx} to={`/coleccion?category=${col.name.toLowerCase()}`} className={cardClass}>
                  <div className={styles.catImageWrapper}>
                    <img src={`${col.image}?auto=format&fit=crop&q=80&w=800`} alt={col.name} className={styles.catImage} />
                    <div className={styles.glassOverlay}>
                      <span className={styles.viewLabel}>VER PIEZAS <Bow size={10} /></span>
                    </div>
                  </div>
                  <div className={styles.catInfo}>
                    <span className={styles.catNumber}>0{idx + 1}</span>
                    <span className={styles.catName}>{col.name}</span>
                    <Bow size={12} className={styles.catBow} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Instagram */}
      <ReelsSection />

    </motion.div>
  );
};