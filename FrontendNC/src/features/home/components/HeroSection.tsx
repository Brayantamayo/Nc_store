import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Bow } from './Moñito';
import { bannerService, type BannerSlide } from '../../banner/services/bannerService';
import styles from '../css/HeroSection.module.css';

// Slides de respaldo mientras carga o si la API no tiene datos todavía
const FALLBACK_SLIDES: BannerSlide[] = [
  {
    id: 0,
    url: '/images/Homesection.png',
    publicId: '',
    titulo: 'Esculpe',
    subtitulo: 'Tu Propio Estilo',
    desc: 'Alta costura desde Medellín.',
    orden: 1,
    activo: true,
    creadoEn: '',
  },
  {
    id: 1,
    url: '/images/Homesection1.png',
    publicId: '',
    titulo: 'Nueva',
    subtitulo: 'Colección',
    desc: 'Piezas únicas de feminidad y detalle.',
    orden: 2,
    activo: true,
    creadoEn: '',
  },
  {
    id: 2,
    url: '/images/Homesection2.png',
    publicId: '',
    titulo: 'Nueva',
    subtitulo: 'Colección',
    desc: 'Piezas únicas de feminidad y detalle.',
    orden: 3,
    activo: true,
    creadoEn: '',
  },
  {
    id: 3,
    url: '/images/Homesection3.png',
    publicId: '',
    titulo: 'Nueva',
    subtitulo: 'Colección',
    desc: 'Piezas únicas de feminidad y detalle.',
    orden: 4,
    activo: true,
    creadoEn: '',
  },
];

export const HeroSection = () => {
  const [slides, setSlides] = useState<BannerSlide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  // Cargar banners activos desde la API
  useEffect(() => {
    bannerService
      .listarActivos()
      .then((data) => {
        if (data.length > 0) setSlides(data);
      })
      .catch(() => {
        // Si falla la API, los slides de respaldo siguen visibles
      });
  }, []);

  const total = slides.length;

  // Reiniciar índice si los slides cambian y el índice queda fuera de rango
  useEffect(() => {
    setCurrent((prev) => (prev >= total ? 0 : prev));
  }, [total]);

  // Auto-avance
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % total);
    }, 5500);
    return () => clearInterval(timer);
  }, [total]);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  const next = () => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % total);
  };

  const slide = slides[current];

  return (
    <section className={styles.hero}>
      {/* Imágenes */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slide.id + '-' + current}
          className={styles.slideWrapper}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <img
            src={slide.url}
            alt={slide.subtitulo}
            className={styles.slideImg}
          />
          <div className={styles.gradientOverlay} />
        </motion.div>
      </AnimatePresence>

      {/* Contenido sobre la imagen */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id + '-text-' + current}
            className={styles.textBlock}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className={styles.badge}>
              <Bow size={12} />
              <span>HECHO CON AMOR • EST. 2024</span>
            </div>
            <h1 className={styles.title}>
              <span className={styles.cursive}>{slide.titulo}</span>
              <span className={styles.bold}>{slide.subtitulo}</span>
            </h1>
            {slide.desc && <p className={styles.desc}>{slide.desc}</p>}
            <a href="#catalogo" className={styles.cta}>
              EXPLORAR COLECCIÓN
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Flechas */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Anterior">
        <ChevronLeft size={22} />
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Siguiente">
        <ChevronRight size={22} />
      </button>

      {/* Indicadores */}
      <div className={styles.indicators}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Contador */}
      <div className={styles.counter}>
        <span className={styles.counterCurrent}>0{current + 1}</span>
        <span className={styles.counterSep} />
        <span className={styles.counterTotal}>0{total}</span>
      </div>
    </section>
  );
};
