import { Link } from 'react-router-dom';
import { Bow } from './Moñito';
import styles from '../css/Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className="container">
          <div className={styles.grid}>
            <div className={styles.brand}>
              <div className={styles.logoWrapper}>
                <Bow size={24} className={styles.footerBow} />
                <h2 className={styles.logo}>NC STORE</h2>
              </div>
              <p className={styles.tagline}>Sofisticación con un toque <span className={styles.cursive}>coquette</span> desde Medellín.</p>
            </div>
            
            <div className={styles.linksColumn}>
              <h3>COMPRAR</h3>
              <Link to="/coleccion">Nueva Colección</Link>
              <Link to="/coleccion?category=tote">Totes</Link>
              <Link to="/coleccion?category=mini">Mini Bags</Link>
              <Link to="/coleccion?category=clutch">Clutches</Link>
            </div>

            <div className={styles.linksColumn}>
              <h3>AYUDA</h3>
              <Link to="/contacto">Contacto</Link>
              <Link to="/envios">Envíos y Devoluciones</Link>
              <Link to="/guia-tallas">Cuidado del Bolso</Link>
              <Link to="/faqs">Preguntas Frecuentes</Link>
            </div>

            <div className={styles.linksColumn}>
              <h3>NC CLUB</h3>
              <p>Suscríbete para recibir lanzamientos exclusivos y editoriales de moda.</p>
              <form className={styles.newsletter} onSubmit={e => e.preventDefault()}>
                <input type="email" placeholder="Tu email" />
                <button type="submit">UNIRSE</button>
              </form>
            </div>
          </div>

          <div className={styles.bottom}>
            <p>© {new Date().getFullYear()} NC STORE Colombia. Todos los derechos reservados.</p>
            <div className={styles.social}>
               <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
               <a href="https://tiktok.com" target="_blank" rel="noreferrer">TikTok</a>
               <a href="https://pinterest.com" target="_blank" rel="noreferrer">Pinterest</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
