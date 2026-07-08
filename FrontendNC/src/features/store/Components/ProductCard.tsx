//Componente que muestra la tarjeta de producto con imagen, nombre, 
// precio y botones de agregar al carrito y favoritos
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, Eye, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Product } from '../../../types';
import { useWishlistStore } from '../pages/wishlistStore';
import { useCartStore } from '../pages/cartStore';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import { useCartFeedbackStore } from '../pages/cartFeedbackStore';
import { Bow } from '../../home/components/Moñito';
import styles from '../css/ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'collection';
}

export const ProductCard = ({ product, index = 0, variant = 'default' }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const { toggle, isWishlisted } = useWishlistStore();
  const { addItem } = useCartStore();
  const triggerFly = useFlyToCartStore((s) => s.triggerFly);
  const showSuccess = useCartFeedbackStore((s) => s.showSuccess);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.isSoldOut) {
      toast.error('Este producto esta agotado.');
      return;
    }

    const source = imageRef.current ?? e.currentTarget;
    triggerFly(product.images[0], source);
    addItem(product, product.colors[selectedColor], 99);
    showSuccess({ productName: product.name, quantity: 1 });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const activeWishlist = isWishlisted(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const isCollection = variant === 'collection';

  return (
    <motion.article
      className={`${styles.card} ${isCollection ? styles.cardCollection : ''}`}
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
      <Link to={`/producto/${product.slug}`} className={styles.imageWrapper}>
        <img
          ref={imageRef}
          src={product.images[0]}
          alt={product.name}
          className={`${styles.image} ${isHovered && product.images[1] ? styles.imageFade : ''}`}
          loading="lazy"
        />

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

        <motion.div
          className={styles.overlay}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.28 }}
        >
          <span className={styles.overlayView}>
            <Eye size={12} strokeWidth={1.5} />
            VER PRODUCTO
          </span>
        </motion.div>

        <div className={styles.badges}>
          {product.isNew && !product.isSoldOut && (
            <span className={styles.badgeNew}>
              <Bow size={8} className={styles.badgeBow} />
              NUEVO
            </span>
          )}
          {product.isSoldOut && <span className={styles.badgeSoldOut}>AGOTADO</span>}
          {hasDiscount && !product.isSoldOut && <span className={styles.badgeSale}>DESCUENTO</span>}
        </div>

        <motion.button
          className={`${styles.wishlistBtn} ${activeWishlist ? styles.wishlistActive : ''}`}
          onClick={(e) => {
            e.preventDefault();
            toggle(product);
          }}
          aria-label={activeWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          whileTap={{ scale: 0.82 }}
        >
          <Heart
            size={14}
            strokeWidth={activeWishlist ? 0 : 1.8}
            fill={activeWishlist ? 'currentColor' : 'none'}
          />
        </motion.button>

        {product.isSoldOut && <div className={styles.soldOverlay} />}
      </Link>

      <div className={styles.info}>
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

        {product.colors?.length > 0 && (
          <div className={styles.swatches} role="group" aria-label="Colores">
            {product.colors.slice(0, 5).map((color, i) => (
              <button
                key={i}
                className={`${styles.swatch} ${selectedColor === i ? styles.swatchSelected : ''}`}
                style={{ background: color.hex }}
                onClick={() => setSelectedColor(i)}
                title={color.name}
                aria-label={color.name}
              />
            ))}
            {product.colors.length > 5 && (
              <span className={styles.swatchMore}>+{product.colors.length - 5}</span>
            )}
          </div>
        )}

        <div className={styles.priceRow}>
          {hasDiscount ? (
            <>
              <p className={styles.price}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </p>
              <p className={styles.originalPrice}>
                Antes: {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(product.originalPrice!)}
              </p>
              <span className={styles.discountLabel}>Descuento</span>
            </>
          ) : (
            <p className={`${styles.price} ${product.isSoldOut ? styles.priceSoldOut : ''}`}>
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
              }).format(product.price)}
            </p>
          )}
        </div>

        <motion.button
          type="button"
          className={`${styles.cardAddBtn} ${isCollection ? styles.cardAddBtnCollection : ''} ${addedToCart ? styles.cardAddBtnSuccess : ''} ${
            product.isSoldOut ? styles.cardAddBtnDisabled : ''
          }`}
          onClick={handleQuickAdd}
          aria-label={addedToCart ? 'Agregado al carrito' : 'Agregar al carrito'}
          whileTap={!product.isSoldOut ? { scale: 0.98 } : undefined}
          disabled={product.isSoldOut}
        >
          <AnimatePresence mode="wait" initial={false}>
            {product.isSoldOut ? (
              <motion.span
                key="soldout"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={styles.cardAddBtnContent}
              >
                AGOTADO
              </motion.span>
            ) : addedToCart ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={styles.cardAddBtnContent}
              >
                <Check size={14} strokeWidth={2.5} />
                AGREGADO
              </motion.span>
            ) : (
              <motion.span
                key="default"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className={styles.cardAddBtnContent}
              >
                <Plus size={14} />
                AGREGAR AL CARRITO
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.article>
  );
};
