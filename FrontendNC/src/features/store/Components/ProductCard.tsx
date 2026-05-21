/// El cuadrito que muestra la foto, nombre y precio de un producto en las listas.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../../../types';
import { useWishlistStore } from '../pages/wishlistStore';
import { useCartStore } from '../pages/cartStore';
import { Bow } from '../../home/components/Moñito';
import styles from '../css/ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { toggle, isWishlisted } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.colors[0]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const activeWishlist = isWishlisted(product.id);

  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/producto/${product.slug}`} className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          {/* Imagen principal */}
          <img
            src={product.images[0]}
            alt={product.name}
            className={`${styles.image} ${isHovered ? styles.imageBack : ''}`}
            loading="lazy"
          />
          {/* Imagen hover */}
          <AnimatePresence>
            {isHovered && product.images[1] && (
              <motion.img
                src={product.images[1]}
                alt={product.name}
                className={styles.imageHover}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Overlay inferior con CTA */}
        <motion.div
          className={styles.overlay}
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 12 }}
          transition={{ duration: 0.3 }}
        >
          <span className={styles.overlayLabel}>
            <Eye size={13} />
            VER PRODUCTO
          </span>
        </motion.div>

        {/* Badges */}
        {product.isNew && (
          <div className={styles.badge}>
            <Bow size={10} className={styles.badgeBow} />
            <span>NUEVO</span>
          </div>
        )}
        {product.isSoldOut && <span className={styles.soldOutBadge}>AGOTADO</span>}

        {/* Wishlist */}
        <motion.button
          className={`${styles.wishlistBtn} ${activeWishlist ? styles.active : ''}`}
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          aria-label="Agregar a favoritos"
          whileTap={{ scale: 0.85 }}
        >
          <Heart size={16} fill={activeWishlist ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Quick add */}
        {!product.isSoldOut && (
          <AnimatePresence>
            {isHovered && (
              <motion.button
                className={`${styles.quickAdd} ${addedToCart ? styles.quickAdded : ''}`}
                onClick={handleQuickAdd}
                aria-label="Agregar rápido al carrito"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.22 }}
                whileTap={{ scale: 0.9 }}
              >
                {addedToCart ? <Bow size={14} /> : <Plus size={18} />}
              </motion.button>
            )}
          </AnimatePresence>
        )}
      </Link>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{product.name}</h3>
          <motion.span
            animate={{ opacity: isHovered ? 1 : 0.3, rotate: isHovered ? 12 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Bow size={13} color="var(--color-accent)" />
          </motion.span>
        </div>

        {/* Swatches de colores */}
        {product.colors && product.colors.length > 0 && (
  <div className={styles.swatches}>
    {product.colors.slice(0, 4).map((color, i) => (
      <span
        key={i}
        className={styles.swatch}
        style={{ background: color.hex }}
        title={color.name}
      />
    ))}
    {product.colors.length > 4 && (
      <span className={styles.swatchMore}>+{product.colors.length - 4}</span>
    )}
  </div>
)}

        <div className={styles.priceRow}>
          <p className={styles.price}>
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0,
            }).format(product.price)}
          </p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className={styles.originalPrice}>
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
              }).format(product.originalPrice)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};