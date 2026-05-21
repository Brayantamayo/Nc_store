import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Bow } from './Moñito';
import styles from '../css/HeroSection.module.css';

// ✅ Agrega aquí más imágenes cuando las tengas
const HERO_SLIDES = [
  {
    image: '/images/Homesection.png',
    title: 'Esculpe',
    subtitle: 'Tu Propio Estilo',
    desc: 'Alta costura desde Medellín.',
  },
  {
    image: '/images/Homesection1.png',
    title: 'Nueva',
    subtitle: 'Colección',
    desc: 'Piezas únicas de feminidad y detalle.',
  },
  {
    image: '/images/Homesection2.png',
    title: 'Nueva',
    subtitle: 'Colección',
    desc: 'Piezas únicas de feminidad y detalle.',
  },
  {
    image: '/images/Homesection3.png',
    title: 'Nueva',
    subtitle: 'Colección',  
    desc: 'Piezas únicas de feminidad y detalle.',
  },
];

export const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = HERO_SLIDES.length;

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

  const slide = HERO_SLIDES[current];

  return (
    <section className={styles.hero}>
      {/* Imágenes */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
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
            src={slide.image}
            alt={slide.subtitle}
            className={styles.slideImg}
          />
          <div className={styles.gradientOverlay} />
        </motion.div>
      </AnimatePresence>

      {/* Contenido sobre la imagen */}
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current + '-text'}
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
              <span className={styles.cursive}>{slide.title}</span>
              <span className={styles.bold}>{slide.subtitle}</span>
            </h1>
            <p className={styles.desc}>{slide.desc}</p>
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
        {HERO_SLIDES.map((_, i) => (
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