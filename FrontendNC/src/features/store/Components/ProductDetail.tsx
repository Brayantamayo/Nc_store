///Es la pagina donde se ve un solo producto a detalle con su precio y descripcion.
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Heart, ArrowRight, Sparkles, ShieldCheck, Truck, X } from 'lucide-react';
import { toast } from 'sonner';

import { useProductStore } from '../pages/productStore';
import { useCartStore } from '../pages/cartStore';
import { useFlyToCartStore } from '../pages/flyToCartStore';
import { useCartFeedbackStore } from '../pages/cartFeedbackStore';
import { useWishlistStore } from '../pages/wishlistStore';
import { productoService } from '../../productos/services/productoService';
import type { Product } from '../../../types';

import { ProductCard } from './ProductCard';

import styles from '../css/ProductDetail.module.css';

// Mapeo de nombres de colores a códigos hex
const colorMap: { [key: string]: string } = {
  negro: '#000000',
  blanco: '#FFFFFF',
  rosado: '#E91E8C',
  rosa: '#E91E8C',
  rojo: '#FF0000',
  azul: '#0066FF',
  verde: '#00AA00',
  amarillo: '#FFFF00',
  naranja: '#FF8800',
  morado: '#9933FF',
  gris: '#808080',
  beige: '#D4BCA8',
  cafe: '#8B4513',
  marron: '#8B4513',
};

const getColorHex = (colorName: string): string => {
  const normalized = colorName.toLowerCase().trim();
  return colorMap[normalized] || '#808080'; // Gris por defecto
};

export const ProductDetail = () => {
  const { products: storeProducts } = useProductStore();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const triggerFly = useFlyToCartStore((s) => s.triggerFly);
  const showSuccess = useCartFeedbackStore((s) => s.showSuccess);
  const { toggle, isWishlisted } = useWishlistStore();
  const mainImageRef = useRef<HTMLImageElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [apiVariantes, setApiVariantes] = useState<Array<{ color?: string; imagenes: string[]; stock?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;
      try {
        const apiProduct = await productoService.obtenerPorSlug(slug);
        
        // Guardar los variantes originales para acceder por color
        setApiVariantes(apiProduct.variantes || []);

        // Transformar producto del API al formato Product
        const variantImages = apiProduct.variantes?.flatMap((v) => v.imagenes) || [];
        const images = variantImages.length > 0
          ? variantImages
          : ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800'];

        const colors = apiProduct.variantes
          ?.map((v) => ({
            name: v.color,
            hex: getColorHex(v.color),
          })) || [];
        
        console.log('Variantes del API:', apiProduct.variantes);
        console.log('Colors mapeados:', colors);

        const transformedProduct: Product = {
          id: String(apiProduct.id),
          slug: apiProduct.slug,
          name: apiProduct.nombre,
          price: Number(apiProduct.precio),
          originalPrice: apiProduct.precioOriginal ? Number(apiProduct.precioOriginal) : undefined,
          images,
          category: apiProduct.categoria?.slug?.toLowerCase() as any || 'general',
          colors,
          material: '',
          description: apiProduct.descripcion || '',
          isNew: false,
          isSoldOut: !apiProduct.variantes || apiProduct.variantes.length === 0,
          isFeatured: false,
          tags: [],
        };

        setProduct(transformedProduct);
        setSelectedColor(colors[0] || null);
        setSelectedImageIndex(0);
      } catch (error) {
        console.error('Error loading product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  // Obtener imágenes del color seleccionado
  const getColorImages = () => {
    if (!selectedColor || apiVariantes.length === 0) {
      return product?.images || [];
    }
    const variant = apiVariantes.find((v) => v.color === selectedColor.name);
    return variant?.imagenes || product?.images || [];
  };

  const colorImages = getColorImages();

  const handleColorChange = (color: any) => {
    setSelectedColor(color);
    setSelectedImageIndex(0);
  };

  if (loading) {
    return (
      <div className="container section" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container section">
        <p>Producto no encontrado</p>
        <button onClick={() => navigate('/coleccion')}>Volver a la coleccion</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.isSoldOut) {
      toast.error('Este producto esta agotado por ahora.');
      return;
    }

    if (!selectedColor) {
      toast.error('Selecciona un color antes de agregarlo al carrito.');
      return;
    }

    // Check available stock
    const variant = apiVariantes.find((v) => v.color === selectedColor.name);
    const availableStock = variant ? variant.stock : 0;

    if (quantity > availableStock) {
      toast.error(`No hay stock suficiente por el momento. Podemos brindarte ${availableStock} unidad${availableStock === 1 ? '' : 'es'}.`);
      if (availableStock > 0) {
        setQuantity(availableStock);
      }
      return;
    }

    const source = mainImageRef.current;
    if (source) {
      triggerFly(colorImages[0], source);
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedColor, availableStock);
    }

    showSuccess({ productName: product.name, quantity });
  };

  const relatedProducts = storeProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const activeWishlist = isWishlisted(product.id);
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const amountSaved = hasDiscount ? product.originalPrice! - product.price : 0;
  const primaryImage = colorImages[selectedImageIndex] ?? colorImages[0];

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
                  {String(selectedImageIndex + 1).padStart(2, '0')} / {String(colorImages.length).padStart(2, '0')}
                </span>
              </div>

              <div 
                className={styles.mainImageWrapper} 
                onClick={() => setIsModalOpen(true)}
                style={{ cursor: 'zoom-in' }}
                title="Hacer clic para ampliar"
              >
                <img ref={mainImageRef} src={primaryImage} alt={product.name} className={styles.mainImage} />
              </div>
            </div>

            {colorImages.length > 1 && (
              <div className={styles.thumbnails}>
                {colorImages.map((img, idx) => (
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
                        onClick={() => handleColorChange(color)}
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

      {/* Modal para ver imagen ampliada */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className={styles.imageModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <button
              className={styles.closeModalBtn}
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar imagen"
            >
              <X size={32} color="#fff" />
            </button>
            <motion.img
              src={primaryImage}
              alt={product.name}
              className={styles.modalImage}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
