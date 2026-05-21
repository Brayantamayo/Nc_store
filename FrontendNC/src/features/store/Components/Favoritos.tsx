import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../../store/pages/wishlistStore';
import { ProductCard } from './ProductCard';
import styles from '../css/Wishlist.module.css';

export const Wishlist = () => {
  const { items } = useWishlistStore();

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Mis Favoritos</h1>
          <p className={styles.subtitle}>Tus piezas elegidas para tu próxima gran entrada.</p>
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Aún no has guardado ninguna pieza.</p>
            <Link to="/coleccion" className={styles.link}>Descubrir ahora</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
