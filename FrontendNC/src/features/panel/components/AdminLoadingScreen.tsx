import { motion } from 'motion/react';
import { Bow } from '../../home/components/Moñito';
import styles from '../css/Admin.module.css';

interface AdminLoadingScreenProps {
  message?: string;
}

export const AdminLoadingScreen = ({ message = 'Iniciando sesión...' }: AdminLoadingScreenProps) => (
  <div className={styles.page}>
    <div className={styles.glowingOrb1} />
    <div className={styles.glowingOrb2} />
    <motion.div
      className={styles.loadingScreen}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <Bow size={40} className={styles.loadingBow} />
      <div className={styles.loadingSpinner} aria-hidden />
      <h2 className={styles.loadingTitle}>NC Panel Control</h2>
      <p className={styles.loadingMessage}>{message}</p>
    </motion.div>
  </div>
);
