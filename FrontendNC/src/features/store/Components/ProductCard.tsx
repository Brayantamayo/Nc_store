/// PRODUCTOS CARD COMO SE MUESTRA EN LA LANDING 
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Eye, Check } from 'lucide-react';
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
  const [selectedColor, setSelectedColor] = useState(0);
  const { toggle, isWishlisted } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.colors[selectedColor]);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const activeWishlist = isWishlisted(product.id);
  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.07,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── IMAGEN ── */}
      <Link to={`/producto/${product.slug}`} className={styles.imageWrapper}>
        {/* Imagen principal */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`${styles.image} ${
            isHovered && product.images[1] ? styles.imageFade : ''
          }`}
          loading="lazy"
        />

        {/* Imagen hover */}
        <AnimatePresence>
          {isHovered && product.images[1] && (
            <motion.img
              src={product.images[1]}
              alt={product.name}
              className={styles.imageHover}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            />
          )}
        </AnimatePresence>

        {/* Overlay con CTA */}
        <motion.div
          className={styles.overlay}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.28 }}
        >
          <span className={styles.overlayView}>
            <Eye size={12} strokeWidth={1.5} />
            VER PRODUCTO
          </span>

          {/* Quick add — sólo si no está agotado */}
          {!product.isSoldOut && (
            <motion.button
              className={`${styles.quickAdd} ${
                addedToCart ? styles.quickAdded : ''
              }`}
              onClick={handleQuickAdd}
              aria-label={addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
              whileTap={{ scale: 0.88 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {addedToCart ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="plus"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Plus size={16} strokeWidth={1.8} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </motion.div>

        {/* Badges */}
        <div className={styles.badges}>
          {product.isNew && !product.isSoldOut && (
            <span className={styles.badgeNew}>
              <Bow size={8} className={styles.badgeBow} />
              NUEVO
            </span>
          )}
          {product.isSoldOut && (
            <span className={styles.badgeSoldOut}>AGOTADO</span>
          )}
          {hasDiscount && !product.isSoldOut && (
            <span className={styles.badgeSale}>OFERTA</span>
          )}
        </div>

        {/* Wishlist */}
        <motion.button
          className={`${styles.wishlistBtn} ${
            activeWishlist ? styles.wishlistActive : ''
          }`}
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
          aria-label={
            activeWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'
          }
          whileTap={{ scale: 0.82 }}
        >
          <Heart
            size={14}
            strokeWidth={activeWishlist ? 0 : 1.8}
            fill={activeWishlist ? 'currentColor' : 'none'}
          />
        </motion.button>

        {/* Overlay agotado */}
        {product.isSoldOut && <div className={styles.soldOverlay} />}
      </Link>

      {/* ── INFO ── */}
      <div className={styles.info}>
        {/* Nombre */}
        <div className={styles.nameRow}>
          <h3 className={styles.name}>{product.name}</h3>
          <motion.span
            className={styles.bowAccent}
            animate={{
              opacity: isHovered ? 1 : 0.25,
              rotate: isHovered ? 10 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <Bow size={12} color="var(--color-accent)" />
          </motion.span>
        </div>

        {/* Swatches */}
        {product.colors?.length > 0 && (
          <div className={styles.swatches} role="group" aria-label="Colores">
            {product.colors.slice(0, 5).map((color, i) => (
              <button
                key={i}
                className={`${styles.swatch} ${
                  selectedColor === i ? styles.swatchSelected : ''
                }`}
                style={{ background: color.hex }}
                onClick={() => setSelectedColor(i)}
                title={color.name}
                aria-label={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className={styles.swatchMore}>
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Precio */}
        <div className={styles.priceRow}>
          <p
            className={`${styles.price} ${
              product.isSoldOut ? styles.priceSoldOut : ''
            }`}
          >
            {new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0,
            }).format(product.price)}
          </p>
          {hasDiscount && (
            <p className={styles.originalPrice}>
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
              }).format(product.originalPrice!)}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
};