///Es la página donde se ve un solo producto a detalle con su precio y descripción.
// 1. Librerías
import { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Minus, Heart, ArrowRight } from 'lucide-react';

// 2. Datos / Tipos
import { useProductStore } from '../pages/productStore';

// 3. Estado (Zustand)
import { useCartStore } from '../pages/cartStore';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import { useCartFeedbackStore } from '../pages/cartFeedbackStore';
import { useWishlistStore } from '../pages/wishlistStore';

// 4. Componentes
import { ProductCard } from './ProductCard';

// 5. Estilos
import styles from '../css/ProductDetail.module.css';

export const ProductDetail = () => {
  const { products } = useProductStore();
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.slug === slug);
  const { addItem } = useCartStore();
  const triggerFly = useFlyToCartStore((s) => s.triggerFly);
  const showSuccess = useCartFeedbackStore((s) => s.showSuccess);
  const { toggle, isWishlisted } = useWishlistStore();
  const mainImageRef = useRef<HTMLImageElement>(null);

  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="container section">
        <p>Producto no encontrado</p>
        <button onClick={() => navigate('/coleccion')}>Volver a la colección</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedColor || product.isSoldOut) return;

    const source = mainImageRef.current;
    if (source) {
      triggerFly(product.images[0], source);
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedColor);
    }

    showSuccess({ productName: product.name, quantity });
  };

  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrapper}>
              <img
                ref={mainImageRef}
                src={product.images[0]}
                alt={product.name}
                className={styles.mainImage}
              />
            </div>
            <div className={styles.thumbnails}>
               {product.images.map((img, idx) => (
                 <div key={idx} className={styles.thumbWrapper}>
                    <img src={img} alt={`${product.name} ${idx}`} className={styles.thumb} />
                 </div>
               ))}
            </div>
          </div>

          {/* Info */}
          <div className={styles.info}>
            <p className={styles.category}>{product.category}</p>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.price}>
              {new Intl.NumberFormat('es-CO', { 
                style: 'currency', 
                currency: 'COP',
                maximumFractionDigits: 0 
              }).format(product.price)}
            </p>

            <div className={styles.description}>
              <p>{product.description}</p>
            </div>

            <div className={styles.selectors}>
              <div className={styles.selectorGroup}>
                <p className={styles.label}>COLOR: {selectedColor?.name}</p>
                <div className={styles.colorSwatches}>
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={`${styles.swatch} ${selectedColor?.name === color.name ? styles.activeSwatch : ''}`}
                      style={{ backgroundColor: color.hex }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.selectorGroup}>
                <p className={styles.label}>CANTIDAD</p>
                <div className={styles.quantity}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={16} /></button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}><Plus size={16} /></button>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                className={styles.addBtn} 
                onClick={handleAddToCart}
                disabled={product.isSoldOut}
              >
                {product.isSoldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
              </button>
              <button 
                className={`${styles.wishlistBtn} ${isWishlisted(product.id) ? styles.activeWish : ''}`}
                onClick={() => toggle(product)}
              >
                <Heart size={20} fill={isWishlisted(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            <div className={styles.details}>
              <div className={styles.detailItem}>
                <span className={styles.detailTitle}>Material</span>
                <span className={styles.detailValue}>{product.material}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailTitle}>Diseño</span>
                <span className={styles.detailValue}>NC Signature</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailTitle}>Envío</span>
                <span className={styles.detailValue}>A todo Colombia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>También te puede gustar</h2>
              <Link to="/coleccion" className={styles.relatedLink}>Ver más <ArrowRight size={16} /></Link>
            </div>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
};
