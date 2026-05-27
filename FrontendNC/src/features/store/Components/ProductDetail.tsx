///Es la pagina donde se ve un solo producto a detalle con su precio y descripcion.
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Minus, Heart, ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';

import { useProductStore } from '../pages/productStore';
import { useCartStore } from '../pages/cartStore';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import { useCartFeedbackStore } from '../pages/cartFeedbackStore';
import { useWishlistStore } from '../pages/wishlistStore';

import { ProductCard } from './ProductCard';

import styles from '../css/ProductDetail.module.css';

export const ProductDetail = () => {
  const { products } = useProductStore();
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCartStore();
  const triggerFly = useFlyToCartStore((s) => s.triggerFly);
  const showSuccess = useCartFeedbackStore((s) => s.showSuccess);
  const { toggle, isWishlisted } = useWishlistStore();
  const mainImageRef = useRef<HTMLImageElement>(null);

  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedColor(product?.colors[0]);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [product]);

  if (!product) {
    return (
      <div className="container section">
        <p>Producto no encontrado</p>
        <button onClick={() => navigate('/coleccion')}>Volver a la coleccion</button>
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

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const activeWishlist = isWishlisted(product.id);
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const amountSaved = hasDiscount ? product.originalPrice! - product.price : 0;
  const primaryImage = product.images[selectedImageIndex] ?? product.images[0];

  return (
    <motion.div className={styles.page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="container">
        <div className={styles.layout}>
          <div className={styles.gallery}>
            <div className={styles.galleryFrame}>
              <div className={styles.galleryHeader}>
                <span className={styles.galleryBadge}>
                  {product.isSoldOut ? 'Pieza agotada' : 'Seleccion exclusiva NC'}
                </span>
                <span className={styles.galleryCounter}>
                  {String(selectedImageIndex + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
                </span>
              </div>

              <div className={styles.mainImageWrapper}>
                <img ref={mainImageRef} src={primaryImage} alt={product.name} className={styles.mainImage} />
              </div>
            </div>

            {product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, idx) => (
                  <button
                    key={`${product.id}-${idx}`}
                    type="button"
                    className={`${styles.thumbWrapper} ${selectedImageIndex === idx ? styles.thumbWrapperActive : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Ver imagen ${idx + 1} de ${product.name}`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className={styles.thumb} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.infoShell}>
              <div className={styles.infoTop}>
                <div>
                  <p className={styles.category}>{product.category}</p>
                  <h1 className={styles.name}>{product.name}</h1>
                </div>

                <button
                  type="button"
                  className={`${styles.wishlistBtn} ${activeWishlist ? styles.activeWish : ''}`}
                  onClick={() => toggle(product)}
                  aria-label={activeWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart size={20} fill={activeWishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.statusPill}>
                  {product.isSoldOut ? 'Agotado' : product.isNew ? 'Nuevo lanzamiento' : 'Disponible'}
                </span>
                {product.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={styles.tagPill}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className={styles.priceBlock}>
                <div className={styles.priceRow}>
                  <p className={styles.price}>
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
                {hasDiscount && <p className={styles.savings}>Ahorras {new Intl.NumberFormat('es-CO').format(amountSaved)}</p>}
              </div>

              <div className={styles.descriptionCard}>
                <p>{product.description}</p>
              </div>

              <div className={styles.purchasePanel}>
                <div className={styles.selectorCard}>
                  <div className={styles.selectorHeader}>
                    <p className={styles.label}>Color</p>
                    <span className={styles.selectorValue}>{selectedColor?.name}</span>
                  </div>

                  <div className={styles.colorSwatches}>
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        className={`${styles.swatch} ${selectedColor?.name === color.name ? styles.activeSwatch : ''}`}
                        onClick={() => setSelectedColor(color)}
                        aria-label={color.name}
                        title={color.name}
                      >
                        <span className={styles.swatchInner} style={{ backgroundColor: color.hex }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.selectorCard}>
                  <div className={styles.selectorHeader}>
                    <p className={styles.label}>Cantidad</p>
                    <span className={styles.selectorValue}>
                      {quantity} unidad{quantity > 1 ? 'es' : ''}
                    </span>
                  </div>

                  <div className={styles.quantity}>
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Disminuir cantidad">
                      <Minus size={16} />
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Aumentar cantidad">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button className={styles.addBtn} onClick={handleAddToCart} disabled={product.isSoldOut}>
                    {product.isSoldOut ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                  </button>
                </div>

                <p className={styles.shippingNote}>
                  Envio a toda Colombia. Empaque delicado y listo para regalar.
                </p>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                  <Sparkles size={18} />
                  <div>
                    <span className={styles.detailTitle}>Material</span>
                    <span className={styles.detailValue}>{product.material}</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <ShieldCheck size={18} />
                  <div>
                    <span className={styles.detailTitle}>Diseno</span>
                    <span className={styles.detailValue}>NC Signature</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <Truck size={18} />
                  <div>
                    <span className={styles.detailTitle}>Envio</span>
                    <span className={styles.detailValue}>Cobertura nacional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className={styles.related}>
            <div className={styles.relatedHeader}>
              <h2 className={styles.relatedTitle}>Tambien te puede gustar</h2>
              <Link to="/coleccion" className={styles.relatedLink}>
                Ver mas <ArrowRight size={16} />
              </Link>
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
