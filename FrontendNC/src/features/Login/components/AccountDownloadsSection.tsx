///DESCARGAR DE LA CUENTA
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from '../css/Login.module.css';

export const AccountDownloadsSection = () => (
  <div className={styles.sectionStack}>
    <div className={styles.statusBanner}>
      <span>Todavia no tienes descargas disponibles.</span>
      <Link to="/coleccion" className={styles.inlineAction}>
        SEGUIR COMPRANDO
        <ChevronRight size={14} />
      </Link>
    </div>
  </div>
);
