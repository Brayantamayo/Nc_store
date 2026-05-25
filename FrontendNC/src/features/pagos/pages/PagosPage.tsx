import { motion } from 'motion/react';
import styles from '../../panel/css/Admin.module.css';

export const PagosPage = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={styles.glassCard}>
    <h2>Pagos</h2>
    <p style={{ color: '#7d6b73', marginTop: '1rem' }}>En proceso — módulo de pagos</p>
  </motion.div>
);
